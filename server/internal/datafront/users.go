package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type usersTable struct {
	repo    components.UserRepo
	tracker components.OnlinePresenceTracker
	table   *dfcore.QueryableTable
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
	users.table = dfcore.NewQueryableTable(users.queryByIds)

	eb.SubscribeTyped(users.sub, events.SourceUsers, events.EventUserCreate, users.onUserCreated)
	eb.SubscribeTyped(users.sub, events.SourceUsers, events.EventUserUpdate, users.onUserUpdated)

	eb.SubscribeTyped(users.sub, events.SourceComms, events.EventClientOnline, users.onUserOnline)
	eb.SubscribeTyped(users.sub, events.SourceComms, events.EventClientOffline, users.onUserOffline)

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
	update[dfcore.EntityID(payload.User.ID)] = common.AsEncodable(api.UsersTableRow{
		IsOnline: &isOnline,
	})
	u.table.PublishEntities(update)
}

func (u *usersTable) onUserOffline(payload events.ClientConnected, _ eb.Event) {
	update := make(map[dfcore.EntityID]common.Encodable)
	isOnline := false
	update[dfcore.EntityID(payload.User.ID)] = common.AsEncodable(api.UsersTableRow{
		IsOnline: &isOnline,
	})
	u.table.PublishEntities(update)
}

func (u *usersTable) queryByIds(
	req dfapi.DFTableRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	uids := make([]domain.UserID, 0, len(req.IDs))
	for _, uid := range req.IDs {
		uids = append(uids, domain.UserID(uid))
	}

	fetchedUsersById, err := u.repo.GetManyByIDs(uids)
	if err != nil {
		return nil, err
	}

	result := dfcore.NewTableResponse()
	for _, user := range fetchedUsersById {
		isOnline, err := u.tracker.IsOnline(user.ID)
		var isOnlineNullable *bool
		if err != nil {
			isOnlineNullable = &isOnline
		}
		result.Add(dfcore.EntityID(user.ID), encodeUser(user, isOnlineNullable))
	}

	return result, nil
}

// func (u *usersTable) queryByUsernames(
// 	payload api.UsersQueryByUsernamePayload,
// 	_ dfapi.DFTableRequest,
// 	_ dfcore.DFRequestContext,
// ) (*dfcore.TableResponse, common.Error) {
// 	if len(payload.Usernames) == 0 {
// 		return nil, common.NewValidationError("UsersQueryByUsernamePayload::Usernames", "no usernames specified")
// 	}

// 	unames := make([]domain.Username, 0, len(payload.Usernames))
// 	for _, uname := range payload.Usernames {
// 		unames = append(unames, domain.Username(uname))
// 	}

// 	fetchedUsersByUsername, err := u.repo.GetManyByUsernames(unames)
// 	if err != nil {
// 		return nil, err
// 	}

// 	result := dfcore.EmptyTableResponse()
// 	for _, user := range fetchedUsersByUsername {
// 		isOnline, err := u.tracker.IsOnline(user.ID)
// 		var isOnlineNullable *bool
// 		if err != nil {
// 			isOnlineNullable = &isOnline
// 		}
// 		result.Add(dfcore.EntityID(user.ID), encodeUser(user, isOnlineNullable))
// 	}

// 	return result, nil
// }

func encodeUser(user domain.User, isOnline *bool) common.Encodable {
	return common.AsEncodable(api.UsersTableRow{
		ID:       string(user.ID),
		Username: string(user.Username),
		Created:  user.Created,
		IsOnline: isOnline,
	})
}
