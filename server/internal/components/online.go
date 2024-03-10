package components

import "srv/internal/domain"

type OnlinePresenceTracker interface {
	IsOnline(username domain.Username) (bool, error)
	ListOnlineUsernames() ([]domain.Username, error)
	GetOnlineCount() (int, error)
}
