package eb

import "srv/internal/utils"

type subscriptionImpl struct {
	bus      *eventBusImpl
	handlers []*subWrapper
}

func (eb *eventBusImpl) CreateSubscription() Subscription {
	return &subscriptionImpl{
		bus:      eb,
		handlers: nil,
	}
}

func (s *subscriptionImpl) Subscribe(source string, event string, handler Subscriber) {
	eb := s.bus
	eb.lock.Lock()
	defer eb.lock.Unlock()

	scope := getScope(source, event)
	wrapper := &subWrapper{
		handler: handler,
		scope:   scope,
	}
	s.handlers = append(s.handlers, wrapper)

	eb.subs[scope] = append(eb.subs[scope], wrapper)
}

func (s *subscriptionImpl) UnsubscribeAll() {
	eb := s.bus
	eb.lock.Lock()
	defer eb.lock.Unlock()

	for _, wrapper := range s.handlers {
		eb.subs[wrapper.scope] = utils.FastRemove(eb.subs[wrapper.scope], wrapper)
	}

	s.handlers = nil
}
