package events

import "srv/internal/domain"

type UserUpdatedPayload struct {
	User domain.User
}

var (
	UserCreated = newEventBus[UserUpdatedPayload]()
	UserUpdated = newEventBus[UserUpdatedPayload]()
)

func initUsers() {
	UserCreated.start()
	UserUpdated.start()
}
