package events

import "srv/internal/domain"

type UserUpdated struct {
	User domain.User
}
