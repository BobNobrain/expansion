package events

import "srv/internal/domain"

const SourceComms = "comms"

const (
	EventClientOnline  = "online"
	EventClientOffline = "offline"
)

type ClientConnected struct {
	User     domain.User
	CliendID domain.ClientID
}
