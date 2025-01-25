package dfcore

import (
	"srv/internal/components"
	"srv/internal/components/dispatcher"
	"srv/internal/domain"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils/common"
	"sync"
)

type DataFront struct {
	dispatcher components.Dispatcher
	// comms      components.Comms
	// scope      components.DispatcherScope

	lock       *sync.RWMutex
	tables     map[DFPath]QueryableTableFrontend
	singletons map[DFPath]QueryableSingletonFrontend

	ebs          eb.Subscription
	updatesQueue *dfUpdatesQueue
}

func NewDataFront(
	disp components.Dispatcher,
	comms components.Comms,
	scope components.DispatcherScope,
) *DataFront {
	result := &DataFront{
		dispatcher: disp,
		// comms:      comms,
		// scope:      scope,

		lock:       new(sync.RWMutex),
		tables:     make(map[DFPath]QueryableTableFrontend),
		singletons: make(map[DFPath]QueryableSingletonFrontend),

		updatesQueue: newDFUpdatesQueue(),
	}

	handler := dispatcher.NewDispatcherHandlerBuilder(scope)
	handler.AddHandler("table", result.handleTableQuery)
	handler.AddHandler("singleton", result.handleSingletonQuery)
	disp.RegisterHandler(handler)

	result.ebs = eb.CreateSubscription()
	eb.SubscribeTyped(result.ebs, "comms", "offline", result.handleClientOffline)

	go result.updatesQueue.run(comms, scope)

	return result
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
		return newPathNotFoundError(fullPath)
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
		return newPathNotFoundError(fullPath)
	}

	delete(df.singletons, fullPath)
	singleton.Dispose()
	return nil
}

func (df *DataFront) Dispose() {
	df.lock.Lock()
	defer df.lock.Unlock()

	for _, q := range df.tables {
		q.Dispose()
	}
	df.tables = nil

	df.ebs.UnsubscribeAll()

	df.updatesQueue.stop()

	// TODO: detach dispatcher listener ??
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
