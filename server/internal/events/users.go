package events

import "srv/internal/domain"

const SourceUsers = "users"

const (
	EventUserCreate = "create"
	EventUserUpdate = "update"
)

type UserUpdated struct {
	User domain.User
}
