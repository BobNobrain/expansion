package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

type usersTable struct {
	repo    components.UserRepo
	tracker components.OnlinePresenceTracker
	table   dfcore.QueryableTable[api.DFUserTableQuery]
	sub     eb.Subscription
}

func (gdf *GameDataFront) InitUsers(repo components.UserRepo, tracker components.OnlinePresenceTracker) {
	if gdf.users != nil {
		panic("GameDataFront.InitUsers() has already been called!")
	}

	users := &usersTable{
		repo:    repo,
		tracker: tracker,
		sub:     eb.CreateSubscription(),
	}
	users.table = dfcore.NewQueryableTable(users.query)

	eb.SubscribeTyped(users.sub, "users", "create", users.onUserCreated)
	eb.SubscribeTyped(users.sub, "users", "update", users.onUserUpdated)

	eb.SubscribeTyped(users.sub, "comms", "online", users.onUserOnline)
	eb.SubscribeTyped(users.sub, "comms", "offline", users.onUserOffline)

	gdf.users = users
	gdf.df.AttachTable(dfcore.DFPath("users"), users.table)
}

func (u *usersTable) dispose() {
	u.sub.UnsubscribeAll()
}

func (u *usersTable) onUserCreated(payload events.UserUpdated, _ eb.Event) {
	update := make(map[dfcore.EntityID]common.Encodable)
	update[dfcore.EntityID(payload.User.ID)] = encodeUser(payload.User, nil)
	u.table.PublishEntities(update)
}

func (u *usersTable) onUserUpdated(payload events.UserUpdated, _ eb.Event) {
	update := make(map[dfcore.EntityID]common.Encodable)
	update[dfcore.EntityID(payload.User.ID)] = encodeUser(payload.User, nil)
	u.table.PublishEntities(update)
}

func (u *usersTable) onUserOnline(payload events.ClientConnected, _ eb.Event) {
	update := make(map[dfcore.EntityID]common.Encodable)
	isOnline := true
	update[dfcore.EntityID(payload.User.ID)] = common.AsEncodable(api.DFUserTableRow{
		IsOnline: &isOnline,
	})
	u.table.PublishEntities(update)
}

func (u *usersTable) onUserOffline(payload events.ClientConnected, _ eb.Event) {
	update := make(map[dfcore.EntityID]common.Encodable)
	isOnline := false
	update[dfcore.EntityID(payload.User.ID)] = common.AsEncodable(api.DFUserTableRow{
		IsOnline: &isOnline,
	})
	u.table.PublishEntities(update)
}

func (u *usersTable) query(q api.DFUserTableQuery) (dfcore.DataSourceResult, common.Error) {
	result := dfcore.DataSourceResult{
		Results: make(map[dfcore.EntityID]common.Encodable),
	}

	if len(q.IDs) > 0 {
		uids := make([]domain.UserID, 0, len(q.IDs))
		for _, uid := range q.IDs {
			uids = append(uids, domain.UserID(uid))
		}

		fetchedUsersById, err := u.repo.GetManyByIDs(uids)
		if err != nil {
			return result, err
		}

		for _, user := range fetchedUsersById {
			isOnline, err := u.tracker.IsOnline(user.ID)
			var isOnlineNullable *bool
			if err != nil {
				isOnlineNullable = &isOnline
			}
			result.Results[dfcore.EntityID(user.ID)] = encodeUser(user, isOnlineNullable)
		}
	}

	if len(q.Usernames) > 0 {
		unames := make([]domain.Username, 0, len(q.Usernames))
		for _, uname := range q.Usernames {
			unames = append(unames, domain.Username(uname))
		}

		fetchedUsersByUsername, err := u.repo.GetManyByUsernames(unames)
		if err != nil {
			return result, err
		}

		for _, user := range fetchedUsersByUsername {
			isOnline, err := u.tracker.IsOnline(user.ID)
			var isOnlineNullable *bool
			if err != nil {
				isOnlineNullable = &isOnline
			}
			result.Results[dfcore.EntityID(user.ID)] = encodeUser(user, isOnlineNullable)
		}
	}

	return result, nil
}

func encodeUser(user domain.User, isOnline *bool) common.Encodable {
	return common.AsEncodable(api.DFUserTableRow{
		ID:       string(user.ID),
		Username: string(user.Username),
		Created:  user.Created,
		IsOnline: isOnline,
	})
}
