package eb

var globalBus EventBus

func Init() {
	globalBus = New()
	globalBus.Start()
}

func Publish(ev Event) {
	globalBus.Publish(ev)
}

func PublishNew(source string, name string, payload any) {
	globalBus.Publish(Event{Source: source, Name: name, Payload: payload})
}

func CreateSubscription() Subscription {
	return globalBus.CreateSubscription()
}
