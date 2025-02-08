package dfcore

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils/common"
	"sync"
)

type DataFront struct {
	lock *sync.RWMutex

	tables     map[DFPath]QueryableTableFrontend
	singletons map[DFPath]QueryableSingletonFrontend
	actions    map[DFPath]ActionFrontend

	ebs                   eb.Subscription
	updatesQueue          *dfUpdatesQueue
	actionsCleanupStopper chan bool
}

func NewDataFront() *DataFront {
	result := &DataFront{
		lock:       new(sync.RWMutex),
		tables:     make(map[DFPath]QueryableTableFrontend),
		singletons: make(map[DFPath]QueryableSingletonFrontend),
		actions:    make(map[DFPath]ActionFrontend),

		updatesQueue:          newDFUpdatesQueue(),
		actionsCleanupStopper: make(chan bool, 1),
	}

	result.ebs = eb.CreateSubscription()
	eb.SubscribeTyped(result.ebs, events.SourceComms, events.EventClientOffline, result.handleClientOffline)
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

	for _, q := range df.tables {
		q.Dispose()
	}
	df.tables = nil

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

func (d *DataFront) handleClientOffline(payload events.ClientConnected, evt eb.Event) {
	d.unsubscribeFromAll(payload.CliendID)
}

func (df *DataFront) unsubscribeFromAll(cid domain.ClientID) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	for _, q := range df.tables {
		q.UnsubscribeFromAll(cid)
	}

	for _, q := range df.singletons {
		q.Unsubscribe(cid)
	}
}
