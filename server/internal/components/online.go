package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type OnlinePresenceTracker interface {
	IsOnline(username domain.UserID) (bool, common.Error)
	ListOnlineUsers() ([]domain.User, common.Error)
	GetOnlineCount() (int, common.Error)
}
