package ws

import "srv/internal/domain"

func (impl *WSComms) AsOnlineTracker() domain.OnlinePresenceTracker {
	return impl
}

func (impl *WSComms) IsOnline(username domain.Username) (bool, error) {
	_, found := impl.clientsByUsername[username]
	return found, nil
}

func (impl *WSComms) ListOnlineUsernames() ([]domain.Username, error) {
	usernames := make([]domain.Username, 0, len(impl.clientsByUsername))
	for u := range impl.clientsByUsername {
		usernames = append(usernames, u)
	}
	return usernames, nil
}

func (impl *WSComms) GetOnlineCount() (int, error) {
	return len(impl.clientsByUsername), nil
}
