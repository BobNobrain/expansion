package api

import "time"

type UserDataUpdateEventPayload struct {
	Username string `json:"username"`
}

type DFUserTableQuery struct {
	IDs       []string `json:"ids"`
	Usernames []string `json:"unames"`
}

type DFUserTableRow struct {
	ID       string    `json:"id,omitempty"`
	Username string    `json:"username,omitempty"`
	Created  time.Time `json:"created,omitempty"`
	IsOnline *bool     `json:"isOnline,omitempty"`
}
