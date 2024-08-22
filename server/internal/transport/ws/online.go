package ws

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/utils/common"
)

func (impl *WSComms) AsOnlineTracker() components.OnlinePresenceTracker {
	return impl
}

func (impl *WSComms) IsOnline(username domain.UserID) (bool, common.Error) {
	_, found := impl.clientsByUserID[username]
	return found, nil
}

func (impl *WSComms) ListOnlineUsers() ([]domain.User, common.Error) {
	uids := make([]domain.UserID, 0, len(impl.clientsByUserID))
	for uid := range impl.clientsByUserID {
		uids = append(uids, uid)
	}
	users, err := impl.users.GetManyByIDs(uids)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (impl *WSComms) GetOnlineCount() (int, common.Error) {
	return len(impl.clientsByUserID), nil
}
