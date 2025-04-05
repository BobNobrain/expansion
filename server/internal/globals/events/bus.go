package events

import (
	"srv/internal/utils"
	"sync"
)

type Subscriber[T any] func(T)

type subscriberWrapper[T any] struct {
	value Subscriber[T]
}

type EventBus[T any] struct {
	lock  *sync.RWMutex
	subs  []*subscriberWrapper[T]
	inbox chan T
}

func newEventBus[T any]() *EventBus[T] {
	return &EventBus[T]{
		lock:  new(sync.RWMutex),
		subs:  nil,
		inbox: make(chan T, 10),
	}
}

func (eb *EventBus[T]) start() {
	go eb.run()
}
func (eb *EventBus[T]) run() {
	for {
		eb.send(<-eb.inbox)
	}
}
func (eb *EventBus[T]) send(ev T) {
	eb.lock.RLock()
	defer eb.lock.RUnlock()

	for _, sub := range eb.subs {
		go sub.value(ev)
	}
}

func (eb *EventBus[T]) Publish(ev T) {
	eb.inbox <- ev
}

type Subscription struct {
	unsubs []func()
}

func NewSubscription() *Subscription {
	return &Subscription{
		unsubs: nil,
	}
}

func (s *Subscription) UnsubscribeAll() {
	for _, unsubscribe := range s.unsubs {
		unsubscribe()
	}

	s.unsubs = nil
}

func SubscribeTyped[T any](s *Subscription, bus *EventBus[T], handler Subscriber[T]) {
	bus.lock.Lock()
	defer bus.lock.Unlock()

	wrapper := &subscriberWrapper[T]{value: handler}
	bus.subs = append(bus.subs, wrapper)

	s.unsubs = append(s.unsubs, func() {
		bus.lock.Lock()
		defer bus.lock.Unlock()

		utils.FastRemove(bus.subs, wrapper)
	})
}
