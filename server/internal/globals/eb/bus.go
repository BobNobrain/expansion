package eb

import (
	"sync"
)

type eventBusImpl struct {
	lock *sync.RWMutex
	subs map[string][]*subWrapper

	inbox chan Event
}

func New() EventBus {
	return &eventBusImpl{
		lock:  new(sync.RWMutex),
		subs:  make(map[string][]*subWrapper),
		inbox: make(chan Event, 10),
	}
}

func (eb *eventBusImpl) Start() {
	go eb.run()
}
func (eb *eventBusImpl) run() {
	for {
		eb.send(<-eb.inbox)
	}
}
func (eb *eventBusImpl) send(ev Event) {
	eb.lock.RLock()
	defer eb.lock.RUnlock()

	scope := getScope(ev.Source, ev.Name)
	subs := eb.subs[scope]
	for _, sub := range subs {
		go sub.handler(ev)
	}
}

func (eb *eventBusImpl) Publish(ev Event) {
	eb.inbox <- ev
}
