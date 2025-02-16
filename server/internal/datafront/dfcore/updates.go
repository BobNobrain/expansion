package dfcore

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/pkg/dfapi"
	"sync"
	"time"
)

type dfUpdatesQueue struct {
	lock           *sync.Mutex
	tableQueue     map[domain.ClientID][]dfapi.DFTableUpdatePatch
	singletonQueue map[domain.ClientID][]dfapi.DFSingletonUpdatePatch
	queriesQueue   map[domain.ClientID][]dfapi.DFTableQueryUpdateNotification

	stopCh     chan bool
	nonEmptyCh chan bool
	empty      bool
}

func newDFUpdatesQueue() *dfUpdatesQueue {
	return &dfUpdatesQueue{
		lock:           new(sync.Mutex),
		tableQueue:     make(map[domain.ClientID][]dfapi.DFTableUpdatePatch),
		singletonQueue: make(map[domain.ClientID][]dfapi.DFSingletonUpdatePatch),
		queriesQueue:   make(map[domain.ClientID][]dfapi.DFTableQueryUpdateNotification),

		stopCh:     make(chan bool),
		nonEmptyCh: make(chan bool, 1),
		empty:      true,
	}
}

// Pushes a new update to the queue for future publishing to all designated clients
func (q *dfUpdatesQueue) pushTable(update dfapi.DFTableUpdatePatch, clients []domain.ClientID) {
	q.lock.Lock()
	defer q.lock.Unlock()

	for _, cid := range clients {
		q.tableQueue[cid] = append(q.tableQueue[cid], update)
	}

	q.notifyNotEmpty()
}

// Pushes a new update to the queue for future publishing to all designated clients
func (q *dfUpdatesQueue) pushSingleton(update dfapi.DFSingletonUpdatePatch, clients []domain.ClientID) {
	q.lock.Lock()
	defer q.lock.Unlock()

	for _, cid := range clients {
		q.singletonQueue[cid] = append(q.singletonQueue[cid], update)
	}

	q.notifyNotEmpty()
}

// Pushes a new update to the queue for future publishing to all designated clients
func (q *dfUpdatesQueue) pushQueryNotification(not dfapi.DFTableQueryUpdateNotification, clients []domain.ClientID) {
	q.lock.Lock()
	defer q.lock.Unlock()

	for _, cid := range clients {
		q.queriesQueue[cid] = append(q.queriesQueue[cid], not)
	}

	q.notifyNotEmpty()
}

// Internal queue method that publishes all the content of the queue to respective clients (batched up)
func (q *dfUpdatesQueue) flush(comms components.Comms) {
	q.lock.Lock()
	defer q.lock.Unlock()

	clients := make(map[domain.ClientID]bool, 0)
	for cid := range q.tableQueue {
		clients[cid] = true
	}
	for cid := range q.singletonQueue {
		clients[cid] = true
	}
	for cid := range q.queriesQueue {
		clients[cid] = true
	}

	for cid := range clients {
		tablePatches := q.tableQueue[cid]
		singletonPatches := q.singletonQueue[cid]
		queryNots := q.queriesQueue[cid]

		comms.Broadcast(components.CommsBroadcastRequest{
			Event:            "update",
			RecipientClients: []domain.ClientID{cid},
			Payload: dfapi.DFUpdateEvent{
				TablePatches:       tablePatches,
				SingletonPatches:   singletonPatches,
				QueryNotifications: queryNots,
			},
		})

		delete(q.tableQueue, cid)
	}

	q.empty = true
}

// internal queue method that notifies the flushing thread that it is not empty anymore
func (q *dfUpdatesQueue) notifyNotEmpty() {
	if q.empty {
		q.empty = false
		q.nonEmptyCh <- true
	}
}

// Starts the queue watching process. Should be run in its own goroutine.
func (q *dfUpdatesQueue) run(comms components.Comms) {
	for {
		select {
		case <-q.stopCh:
			return

		case <-q.nonEmptyCh:
			// 20ms should be enough to batch all the updates
			// if some updates take longer to arrive, let 'em be published in
			// a separate message
			timer := time.NewTimer(20 * time.Millisecond)
			select {
			case <-q.stopCh:
				// ignoring all unpublished events:
				// if somebody called .Dispose() of DataFront, we're probably
				// shutting down the server anyway
				timer.Stop()
				return

			case <-timer.C:
				q.flush(comms)
			}
		}
	}
}

// Stops the queue watching process (blocking)
func (q *dfUpdatesQueue) stop() {
	q.stopCh <- true
}
