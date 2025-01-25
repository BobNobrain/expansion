package dfcore

import (
	"encoding/json"
	"slices"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"
)

type EntityID string

type queryableTableImpl[Query any] struct {
	df   *DataFront
	path DFPath

	lock *sync.RWMutex
	// TODO: map[ID]map[domain.ClientID]int ? To count all the subs from different queries?
	idSubs        map[EntityID][]domain.ClientID
	idSubsReverse map[domain.ClientID][]EntityID
	// qSubs         map[Query][]domain.ClientID
	ds QueryableTableDataSource[Query]
}

type QueryableTableFrontend interface {
	Query(dfapi.DFTableRequest, domain.ClientID) ([]any, common.Error)
	UnsubscribeFromIDs(dfapi.DFTableUnsubscribeRequest, domain.ClientID)
	UnsubscribeFromAll(domain.ClientID)
	Attach(*DataFront, DFPath)
	Dispose()
}

type QueryableTableController[Query any] interface {
	PublishEntities(map[EntityID]common.Encodable)
	PublishQuery(q Query, added map[EntityID]common.Encodable, removed map[EntityID]common.Encodable)
}

type QueryableTable[Query any] interface {
	QueryableTableFrontend
	QueryableTableController[Query]
}

type DataSourceResult struct {
	Results map[EntityID]common.Encodable
	// TODO: this should be some LiveQueryKey that will somehow allow us to use
	// PublishQuery(liveQueryKey) and update the queries on the client
	IsLive bool
}

type QueryableTableDataSource[Q any] func(Q) (DataSourceResult, common.Error)

func NewQueryableTable[Query any](
	ds QueryableTableDataSource[Query],
) QueryableTable[Query] {
	table := &queryableTableImpl[Query]{
		lock:   new(sync.RWMutex),
		idSubs: make(map[EntityID][]domain.ClientID),
		// qSubs:  make(map[Query][]domain.ClientID),
		ds: ds,
	}

	return table
}

func (q *queryableTableImpl[Query]) Attach(df *DataFront, path DFPath) {
	q.df = df
	q.path = path
}

func (q *queryableTableImpl[Query]) Dispose() {
	q.lock.Lock()
	defer q.lock.Unlock()

	q.idSubs = nil
	// q.qSubs = nil
}

func (table *queryableTableImpl[Query]) Query(
	req dfapi.DFTableRequest,
	client domain.ClientID,
) ([]any, common.Error) {
	var query Query
	jerr := json.Unmarshal(req.Query, &query)
	if jerr != nil {
		return nil, common.NewWrapperError("ERR_DECODE", jerr)
	}

	rows, err := table.ds(query)
	if err != nil {
		return nil, err
	}

	table.lock.Lock()
	defer table.lock.Unlock()

	encodedRows := make([]any, 0, len(rows.Results))
	for id, row := range rows.Results {
		table.subscribeForID(id, client)
		encodedRows = append(encodedRows, row.Encode())
	}

	return encodedRows, nil
}

func (table *queryableTableImpl[Query]) UnsubscribeFromAll(cid domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	subs, found := table.idSubsReverse[cid]
	if !found {
		return
	}
	delete(table.idSubsReverse, cid)

	for _, id := range subs {
		table.idSubs[id] = utils.FastRemove(table.idSubs[id], cid)
	}
}

func (table *queryableTableImpl[Query]) UnsubscribeFromIDs(req dfapi.DFTableUnsubscribeRequest, cid domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	for _, id := range req.IDs {
		eid := EntityID(id)
		table.idSubsReverse[cid] = utils.FastRemove(table.idSubsReverse[cid], eid)
		table.idSubs[eid] = utils.FastRemove(table.idSubs[eid], cid)
	}
}

func (table *queryableTableImpl[Query]) PublishEntities(entities map[EntityID]common.Encodable) {
	table.lock.RLock()
	defer table.lock.RUnlock()

	for eid, entity := range entities {
		subs := table.idSubs[eid]
		table.df.updatesQueue.pushTable(dfapi.DFTableUpdatePatch{
			Path:     table.path.String(),
			EntityID: string(eid),
			Update:   entity.Encode(),
		}, subs)
	}
}

func (table *queryableTableImpl[Query]) PublishQuery(
	q Query,
	added map[EntityID]common.Encodable,
	removed map[EntityID]common.Encodable,
) {
	// TODO: live queries (coming whenever we'll need them)
}

func (table *queryableTableImpl[Query]) subscribeForID(id EntityID, client domain.ClientID) {
	cids := table.idSubs[id]
	if slices.Index(cids, client) == -1 {
		table.idSubs[id] = append(cids, client)
		table.idSubsReverse[client] = append(table.idSubsReverse[client], id)
	}
}
