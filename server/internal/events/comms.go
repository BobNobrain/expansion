package events

import "srv/internal/domain"

type ClientConnected struct {
	User     domain.User
	CliendID domain.ClientID
}
