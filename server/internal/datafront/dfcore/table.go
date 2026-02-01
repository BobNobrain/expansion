package dfcore

import (
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"
)

type QueryableTable struct {
	df   *DataFront
	path DFPath

	lock          *sync.RWMutex
	idSubs        map[domain.EntityID]*utils.UndeterministicSet[domain.ClientID]
	idSubsReverse map[domain.ClientID]*utils.UndeterministicSet[domain.EntityID]
	dataSource    TableDataSource
}

type QueryableTableFrontend interface {
	Query(dfapi.DFTableRequest, domain.RequestContext) (common.Encodable, common.Error)
	UnsubscribeFromIDs(dfapi.DFTableUnsubscribeRequest, domain.ClientID)
	UnsubscribeFromAll(domain.ClientID)
	Attach(*DataFront, DFPath)
	Dispose()
}

type TableDataSource func(dfapi.DFTableRequest, domain.RequestContext) (domain.EntityCollection, common.Error)

func NewQueryableTable(dataSource TableDataSource) *QueryableTable {
	table := &QueryableTable{
		lock:          new(sync.RWMutex),
		idSubs:        make(map[domain.EntityID]*utils.UndeterministicSet[domain.ClientID]),
		idSubsReverse: make(map[domain.ClientID]*utils.UndeterministicSet[domain.EntityID]),
		dataSource:    dataSource,
	}

	return table
}

func (q *QueryableTable) Attach(df *DataFront, path DFPath) {
	q.df = df
	q.path = path
}

func (q *QueryableTable) Dispose() {
	q.lock.Lock()
	defer q.lock.Unlock()

	q.idSubs = nil
}

func (table *QueryableTable) Query(
	req dfapi.DFTableRequest,
	ctx domain.RequestContext,
) (common.Encodable, common.Error) {
	rows, err := table.dataSource(req, ctx)
	if err != nil {
		return nil, err
	}

	rows.ApplyAccessControl(ctx)
	table.subscribeForResponse(rows, ctx.ClientID)
	return rows.AsEncodableMap(), nil
}

func (table *QueryableTable) UnsubscribeFromAll(cid domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	subs, found := table.idSubsReverse[cid]
	if !found {
		return
	}
	delete(table.idSubsReverse, cid)

	for id := range subs.Items() {
		table.idSubs[id].Remove(cid)
	}
}

func (table *QueryableTable) UnsubscribeFromIDs(req dfapi.DFTableUnsubscribeRequest, cid domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	for _, id := range req.IDs {
		eid := domain.EntityID(id)

		subs := table.idSubs[eid]
		if subs != nil {
			subs.Remove(cid)
		}

		revSubs := table.idSubsReverse[cid]
		if revSubs != nil {
			revSubs.Remove(eid)
		}
	}
}

func (table *QueryableTable) PublishEntities(entities domain.EntityCollection) {
	table.lock.RLock()
	defer table.lock.RUnlock()

	for _, eid := range entities.GetIDs() {
		subs := table.idSubs[eid]
		if subs == nil {
			continue
		}
		table.df.updatesQueue.pushTable(dfapi.DFTableUpdatePatch{
			Path:     table.path.String(),
			EntityID: string(eid),
			Update:   entities.GetEncodedEntity(eid).Encode(),
		}, subs.ToSlice())
	}
}
func (table *QueryableTable) UnpublishEntities(entities []domain.EntityID) {
	table.lock.RLock()
	defer table.lock.RUnlock()

	for _, eid := range entities {
		subs := table.idSubs[eid]
		if subs == nil {
			continue
		}
		table.df.updatesQueue.pushTable(dfapi.DFTableUpdatePatch{
			Path:     table.path.String(),
			EntityID: string(eid),
			Update:   nil,
		}, subs.ToSlice())
	}
}

func (table *QueryableTable) subscribeForResponse(response domain.EntityCollection, client domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	for _, id := range response.GetIDs() {
		if table.idSubs[id] == nil {
			table.idSubs[id] = utils.NewUndeterministicSet[domain.ClientID]()
		}
		if table.idSubsReverse[client] == nil {
			table.idSubsReverse[client] = utils.NewUndeterministicSet[domain.EntityID]()
		}

		table.idSubs[id].Add(client)
		table.idSubsReverse[client].Add(id)
	}
}
