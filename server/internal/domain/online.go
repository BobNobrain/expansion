package domain

type OnlinePresenceTracker interface {
	IsOnline(username Username) (bool, error)
	ListOnlineUsernames() ([]Username, error)
	GetOnlineCount() (int, error)
}
