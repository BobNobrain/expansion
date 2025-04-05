package events

import "srv/internal/domain"

type ClientConnected struct {
	User     domain.User
	CliendID domain.ClientID
}

var (
	ClientOnline  = newEventBus[ClientConnected]()
	ClientOffline = newEventBus[ClientConnected]()
)

func initComms() {
	ClientOnline.start()
	ClientOffline.start()
}
