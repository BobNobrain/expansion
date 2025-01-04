package eb

type subWrapper struct {
	handler Subscriber
	scope   string
}

func getScope(source, name string) string {
	return source + ":" + name
}

func SubscribeTyped[T any](s Subscription, source string, event string, handler func(T, Event)) {
	s.Subscribe(source, event, func(e Event) {
		payload, ok := e.Payload.(T)
		if !ok {
			// can't do anything
			// maybe should log it
			return
		}

		handler(payload, e)
	})
}
