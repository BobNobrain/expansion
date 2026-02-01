package domain

import "time"

type RequestContext struct {
	ClientID ClientID
	UserID   UserID
	Received time.Time
}
