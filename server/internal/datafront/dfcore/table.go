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
	idSubs        map[EntityID]*utils.UndeterministicSet[domain.ClientID]
	idSubsReverse map[domain.ClientID]*utils.UndeterministicSet[EntityID]
	dataSource    TableDataSource
}

type QueryableTableFrontend interface {
	Query(dfapi.DFTableRequest, DFRequestContext) (map[string]any, common.Error)
	UnsubscribeFromIDs(dfapi.DFTableUnsubscribeRequest, domain.ClientID)
	UnsubscribeFromAll(domain.ClientID)
	Attach(*DataFront, DFPath)
	Dispose()
}

type TableDataSource func(dfapi.DFTableRequest, DFRequestContext) (*TableResponse, common.Error)

func NewQueryableTable(dataSource TableDataSource) *QueryableTable {
	table := &QueryableTable{
		lock:          new(sync.RWMutex),
		idSubs:        make(map[EntityID]*utils.UndeterministicSet[domain.ClientID]),
		idSubsReverse: make(map[domain.ClientID]*utils.UndeterministicSet[EntityID]),
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
	ctx DFRequestContext,
) (map[string]any, common.Error) {
	rows, err := table.dataSource(req, ctx)
	if err != nil {
		return nil, err
	}

	table.subscribeForResponse(rows, ctx.ClientID)
	return rows.Encode(), nil
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
		eid := EntityID(id)

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

func (table *QueryableTable) PublishEntities(entities *TableResponse) {
	table.lock.RLock()
	defer table.lock.RUnlock()

	for eid, entity := range entities.results {
		subs := table.idSubs[eid]
		if subs == nil {
			continue
		}
		table.df.updatesQueue.pushTable(dfapi.DFTableUpdatePatch{
			Path:     table.path.String(),
			EntityID: string(eid),
			Update:   entity.Encode(),
		}, subs.ToSlice())
	}
}

func (table *QueryableTable) subscribeForResponse(response *TableResponse, client domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	for id := range response.results {
		if table.idSubs[id] == nil {
			table.idSubs[id] = utils.NewUndeterministicSet[domain.ClientID]()
		}
		if table.idSubsReverse[client] == nil {
			table.idSubsReverse[client] = utils.NewUndeterministicSet[EntityID]()
		}

		table.idSubs[id].Add(client)
		table.idSubsReverse[client].Add(id)
	}
}
