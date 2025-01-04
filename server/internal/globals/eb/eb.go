package eb

type Event struct {
	Source  string
	Name    string
	Payload any
}

type Subscriber func(Event)

type Subscription interface {
	Subscribe(source string, event string, sub Subscriber)
	UnsubscribeAll()
}

type EventBus interface {
	Start()

	CreateSubscription() Subscription
	Publish(Event)
}
