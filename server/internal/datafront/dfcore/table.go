package dfcore

import (
	"encoding/json"
	"fmt"
	"slices"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"
)

type EntityID string

type QueryableTable struct {
	df   *DataFront
	path DFPath

	lock *sync.RWMutex
	// TODO: map[ID]map[domain.ClientID]int ? To count all the subs from different queries?
	idSubs        map[EntityID][]domain.ClientID
	idSubsReverse map[domain.ClientID][]EntityID
	dataSources   map[string]func(dfapi.DFTableRequest, DFRequestContext) (*TableResponse, common.Error)
}

type QueryableTableFrontend interface {
	Query(dfapi.DFTableRequest, DFRequestContext) (map[string]any, common.Error)
	UnsubscribeFromIDs(dfapi.DFTableUnsubscribeRequest, domain.ClientID)
	UnsubscribeFromAll(domain.ClientID)
	Attach(*DataFront, DFPath)
	Dispose()
}

func NewQueryableTable() *QueryableTable {
	table := &QueryableTable{
		lock:          new(sync.RWMutex),
		idSubs:        make(map[EntityID][]domain.ClientID),
		idSubsReverse: make(map[domain.ClientID][]EntityID),
		dataSources:   make(map[string]func(dfapi.DFTableRequest, DFRequestContext) (*TableResponse, common.Error)),
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
	handler, found := table.dataSources[req.QueryType]
	if !found {
		return nil, common.NewValidationError(
			"DFTableRequest::QueryType",
			fmt.Sprintf("unknown query type '%s'", req.QueryType),
		)
	}

	rows, err := handler(req, ctx)
	if err != nil {
		return nil, err
	}

	table.lock.Lock()
	defer table.lock.Unlock()

	encodedRows := make(map[string]any, len(rows.results))
	for id, row := range rows.results {
		table.subscribeForID(id, ctx.ClientID)
		encodedRows[string(id)] = row.Encode()
	}

	return encodedRows, nil
}

func (table *QueryableTable) UnsubscribeFromAll(cid domain.ClientID) {
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

func (table *QueryableTable) UnsubscribeFromIDs(req dfapi.DFTableUnsubscribeRequest, cid domain.ClientID) {
	table.lock.Lock()
	defer table.lock.Unlock()

	for _, id := range req.IDs {
		eid := EntityID(id)
		table.idSubsReverse[cid] = utils.FastRemove(table.idSubsReverse[cid], eid)
		table.idSubs[eid] = utils.FastRemove(table.idSubs[eid], cid)
	}
}

func (table *QueryableTable) PublishEntities(entities map[EntityID]common.Encodable) {
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

func AddTypedTableDataSource[Payload any](
	table *QueryableTable,
	queryType string,
	ds func(Payload, dfapi.DFTableRequest, DFRequestContext) (*TableResponse, common.Error),
) {
	table.lock.Lock()
	defer table.lock.Unlock()

	table.dataSources[queryType] = func(rq dfapi.DFTableRequest, ctx DFRequestContext) (*TableResponse, common.Error) {
		var decoded Payload
		err := json.Unmarshal(rq.Payload, &decoded)
		if err != nil {
			return EmptyTableResponse(), common.NewDecodingError(err)
		}

		return ds(decoded, rq, ctx)
	}
}

func (table *QueryableTable) subscribeForID(id EntityID, client domain.ClientID) {
	cids := table.idSubs[id]
	if slices.Index(cids, client) == -1 {
		table.idSubs[id] = append(cids, client)
		table.idSubsReverse[client] = append(table.idSubsReverse[client], id)
	}
}

type TableResponse struct {
	results map[EntityID]common.Encodable
	// TODO: here should be some LiveQueryKey that will somehow allow us to use
	// PublishQuery(liveQueryKey) and update the queries on the client
}

func SingleEntityTableResponse(eid EntityID, data common.Encodable) *TableResponse {
	results := make(map[EntityID]common.Encodable)
	results[eid] = data
	return &TableResponse{results: results}
}
func EmptyTableResponse() *TableResponse {
	return &TableResponse{results: make(map[EntityID]common.Encodable)}
}

func (t TableResponse) Add(eid EntityID, data common.Encodable) {
	t.results[eid] = data
}
