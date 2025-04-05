package dfcore

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
	"sync"
)

type DataFront struct {
	lock *sync.RWMutex

	tables       map[DFPath]QueryableTableFrontend
	tableQueries map[DFPath]TrackableTableQueryFrontend
	singletons   map[DFPath]QueryableSingletonFrontend
	actions      map[DFPath]ActionFrontend

	ebs                   *events.Subscription
	updatesQueue          *dfUpdatesQueue
	actionsCleanupStopper chan bool
}

func NewDataFront() *DataFront {
	result := &DataFront{
		lock:         new(sync.RWMutex),
		tables:       make(map[DFPath]QueryableTableFrontend),
		tableQueries: make(map[DFPath]TrackableTableQueryFrontend),
		singletons:   make(map[DFPath]QueryableSingletonFrontend),
		actions:      make(map[DFPath]ActionFrontend),

		updatesQueue:          newDFUpdatesQueue(),
		actionsCleanupStopper: make(chan bool, 1),
	}

	result.ebs = events.NewSubscription()
	events.SubscribeTyped(result.ebs, events.ClientOffline, result.handleClientOffline)
	return result
}

func (df *DataFront) Run(comms components.Comms) {
	go df.updatesQueue.run(comms)
	go df.runTokensCleanup()
}

func (df *DataFront) AttachTable(fullPath DFPath, table QueryableTableFrontend) {
	df.lock.Lock()
	defer df.lock.Unlock()

	df.tables[fullPath] = table
	table.Attach(df, fullPath)
}
func (df *DataFront) RemoveTable(fullPath DFPath) common.Error {
	df.lock.Lock()
	defer df.lock.Unlock()

	table, found := df.tables[fullPath]
	if !found {
		return common.NewValidationError("fullPath", "table path does not exist")
	}

	delete(df.tables, fullPath)
	table.Dispose()
	return nil
}

func (df *DataFront) AttachTableQuery(fullPath DFPath, query TrackableTableQueryFrontend) {
	df.lock.Lock()
	defer df.lock.Unlock()

	df.tableQueries[fullPath] = query
	query.Attach(df, fullPath)
}
func (df *DataFront) RemoveTableQuery(fullPath DFPath) common.Error {
	df.lock.Lock()
	defer df.lock.Unlock()

	query, found := df.tableQueries[fullPath]
	if !found {
		return common.NewValidationError("fullPath", "table query path does not exist")
	}

	delete(df.tableQueries, fullPath)
	query.Dispose()
	return nil
}

func (df *DataFront) AttachSingleton(fullPath DFPath, singleton QueryableSingletonFrontend) {
	df.lock.Lock()
	defer df.lock.Unlock()

	df.singletons[fullPath] = singleton
	singleton.Attach(df, fullPath)
}
func (df *DataFront) RemoveSingleton(fullPath DFPath) common.Error {
	df.lock.Lock()
	defer df.lock.Unlock()

	singleton, found := df.singletons[fullPath]
	if !found {
		return common.NewValidationError("fullPath", "singleton path does not exist")
	}

	delete(df.singletons, fullPath)
	singleton.Dispose()
	return nil
}

func (df *DataFront) AttachAction(fullPath DFPath, action ActionFrontend) {
	df.lock.Lock()
	defer df.lock.Unlock()

	df.actions[fullPath] = action
}
func (df *DataFront) RemoveAction(fullPath DFPath) common.Error {
	df.lock.Lock()
	defer df.lock.Unlock()

	action, found := df.actions[fullPath]
	if !found {
		return common.NewValidationError("fullPath", "action path does not exist")
	}

	delete(df.actions, fullPath)
	action.Dispose()
	return nil
}

func (df *DataFront) Dispose() {
	df.actionsCleanupStopper <- true

	df.lock.Lock()
	defer df.lock.Unlock()

	for _, t := range df.tables {
		t.Dispose()
	}
	df.tables = nil

	for _, q := range df.tableQueries {
		q.Dispose()
	}
	df.tableQueries = nil

	for _, s := range df.singletons {
		s.Dispose()
	}
	df.singletons = nil

	for _, a := range df.actions {
		a.Dispose()
	}
	df.actions = nil

	df.ebs.UnsubscribeAll()

	df.updatesQueue.stop()
}

func (d *DataFront) handleClientOffline(payload events.ClientConnected) {
	d.unsubscribeFromAll(payload.CliendID)
}

func (df *DataFront) unsubscribeFromAll(cid domain.ClientID) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	for _, t := range df.tables {
		t.UnsubscribeFromAll(cid)
	}

	for _, q := range df.tableQueries {
		q.UnsubscribeFromAll(cid)
	}

	for _, q := range df.singletons {
		q.Unsubscribe(cid)
	}
}
