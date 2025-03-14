package dfcore

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"
)

type TableQueryDataSource[P any] func(P, dfapi.DFTableQueryRequest, DFRequestContext) (*TableResponse, common.Error)

type TrackableTableQuery[P comparable] struct {
	lock      *sync.Mutex
	listeners map[P]*utils.UndeterministicSet[domain.ClientID]

	updater     *dfUpdatesQueue
	dataSource  TableQueryDataSource[P]
	sourceTable *QueryableTable
	path        DFPath
}

type TrackableTableQueryFrontend interface {
	Query(dfapi.DFTableQueryRequest, DFRequestContext) (map[string]any, common.Error)
	Unsubscribe(dfapi.DFTableQueryUnsubscribeRequest, domain.ClientID) common.Error
	UnsubscribeFromAll(domain.ClientID)
	Attach(*DataFront, DFPath)
	Dispose()
}

func NewTrackableTableQuery[P comparable](
	dataSource TableQueryDataSource[P],
	sourceTable *QueryableTable,
) *TrackableTableQuery[P] {
	ttq := &TrackableTableQuery[P]{
		lock:        new(sync.Mutex),
		listeners:   make(map[P]*utils.UndeterministicSet[domain.ClientID]),
		dataSource:  dataSource,
		sourceTable: sourceTable,
	}

	return ttq
}

func (query *TrackableTableQuery[P]) Query(
	req dfapi.DFTableQueryRequest,
	ctx DFRequestContext,
) (map[string]any, common.Error) {
	var payload P
	err := json.Unmarshal(req.Payload, &payload)
	if err != nil {
		return nil, common.NewDecodingError(err)
	}

	rows, err := query.dataSource(payload, req, ctx)

	if query.listeners[payload] == nil {
		query.listeners[payload] = utils.NewUndeterministicSet[domain.ClientID]()
	}
	query.listeners[payload].Add(ctx.ClientID)
	query.sourceTable.subscribeForResponse(rows, ctx.ClientID)

	return rows.Encode(), nil
}

func (q *TrackableTableQuery[P]) PublishChangedNotification(payload P) {
	subs := q.listeners[payload]
	if subs == nil {
		return
	}

	q.updater.pushQueryNotification(dfapi.DFTableQueryUpdateNotification{
		Path:    string(q.path),
		Payload: payload,
	}, subs.ToSlice())
}

func (q *TrackableTableQuery[P]) Unsubscribe(
	req dfapi.DFTableQueryUnsubscribeRequest,
	client domain.ClientID,
) common.Error {
	var payload P
	err := json.Unmarshal(req.Payload, &payload)
	if err != nil {
		return common.NewDecodingError(err)
	}

	if q.listeners[payload] != nil {
		q.listeners[payload].Remove(client)
	}

	return nil
}

func (q *TrackableTableQuery[P]) UnsubscribeFromAll(client domain.ClientID) {
	for payload, listeners := range q.listeners {
		listeners.Remove(client)
		if listeners.Size() == 0 {
			delete(q.listeners, payload)
		}
	}
}

func (q *TrackableTableQuery[P]) Attach(df *DataFront, path DFPath) {
	q.updater = df.updatesQueue
	q.path = path
}

func (q *TrackableTableQuery[P]) Dispose() {
	q.listeners = nil
}
