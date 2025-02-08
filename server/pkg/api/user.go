package api

import "time"

const (
	UsersQueryTypeByID       = "byId"
	UsersQueryTypeByUsername = "byUsername"
)

type UsersQueryByIDPayload struct {
	IDs []string `json:"ids"`
}

type UsersQueryByUsernamePayload struct {
	Usernames []string `json:"unames"`
}

type UsersTableRow struct {
	ID       string    `json:"id"`
	Username string    `json:"username,omitempty"`
	Created  time.Time `json:"created,omitempty"`
	IsOnline *bool     `json:"isOnline,omitempty"`
}

type MeSingletonValue struct {
	UserID   string    `json:"userId"`
	Username string    `json:"username"`
	Created  time.Time `json:"created"`
	// TODO: company ids
}
