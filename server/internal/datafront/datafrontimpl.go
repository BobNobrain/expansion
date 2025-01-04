package datafront

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
	comms      components.Comms
	scope      components.DispatcherScope

	root *treeImpl

	lock         *sync.Mutex
	subsByClient map[domain.ClientID][]ReactiveData

	ebs eb.Subscription
}

func NewDataFront(disp components.Dispatcher, comms components.Comms, scope components.DispatcherScope) *DataFront {
	result := &DataFront{
		dispatcher: disp,
		comms:      comms,
		scope:      scope,

		root: newTreeImpl(),

		lock:         new(sync.Mutex),
		subsByClient: make(map[domain.ClientID][]ReactiveData),
	}

	handler := dispatcher.NewDispatcherHandlerBuilder(scope)
	handler.AddHandler("query", result.HandleQuery)

	disp.RegisterHandler(handler)

	result.ebs = eb.CreateSubscription()
	eb.SubscribeTyped[events.ClientConnected](result.ebs, "comms", "offline", result.handleClientOffline)

	return result
}

func (df *DataFront) AttachValue(fullPath DFPath, value ReactiveData) {
	path, dataName := fullPath.Pop()
	subtree := df.root.mkdirp(path)
	subtree.attachValue(dataName, value)
	value.Attach(df, fullPath)
}

func (d *DataFront) RemoveValue(fullPath DFPath) common.Error {
	path, dataName := fullPath.Pop()
	tree, notFoundIdx := d.root.subtree(path)
	if tree == nil {
		return newPathNotFoundError(path, notFoundIdx)
	}

	tree.detachValue(dataName)
	return nil
}

func (d *DataFront) CreateSubtree(path DFPath) {
	d.root.mkdirp(path)
}

func (d *DataFront) RemoveSubtree(fullPath DFPath) common.Error {
	path, dataName := fullPath.Pop()
	tree, notFoundIdx := d.root.subtree(path)
	if tree == nil {
		return newPathNotFoundError(path, notFoundIdx)
	}

	tree.removeSubtree(dataName)
	return nil
}

func (d *DataFront) Dispose() {
	d.root.Dispose()
	d.root = nil
	d.ebs.UnsubscribeAll()
	// TODO: detach dispatcher listener ??
}

func (d *DataFront) HandleQuery(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	query, err := dispatcher.DecodeJSONCmdPayload[DFRequest](cmd)
	if err != nil {
		return nil, err
	}

	data, err := d.root.getData(query.GetPath())
	if err != nil {
		return nil, err
	}

	if !query.JustBrowsing {
		data.Subscribe(cmd.ClientID)
	}

	return data.GetValue(), nil
}

func (d *DataFront) handleClientOffline(payload events.ClientConnected, evt eb.Event) {
	d.unsubscribeFromAll(payload.CliendID)
}

func (d *DataFront) unsubscribeFromAll(cid domain.ClientID) {
	d.lock.Lock()
	defer d.lock.Unlock()

	subs, found := d.subsByClient[cid]
	if !found {
		return
	}

	for _, sub := range subs {
		sub.Unsubscribe(cid)
	}
	delete(d.subsByClient, cid)
}
