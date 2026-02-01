package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type usersTable struct {
	repo    components.UserRepoReadonly
	tracker components.OnlinePresenceTracker
	table   *dfcore.QueryableTable
	sub     *events.Subscription
}

func (gdf *GameDataFront) InitUsers(repo components.UserRepoReadonly, tracker components.OnlinePresenceTracker) {
	if gdf.users != nil {
		panic("GameDataFront.InitUsers() has already been called!")
	}

	users := &usersTable{
		repo:    repo,
		tracker: tracker,
		sub:     events.NewSubscription(),
	}
	users.table = dfcore.NewQueryableTable(users.queryByIds)

	events.SubscribeTyped(users.sub, events.UserCreated, users.onUserCreated)
	events.SubscribeTyped(users.sub, events.UserUpdated, users.onUserUpdated)

	events.SubscribeTyped(users.sub, events.ClientOnline, users.onUserOnline)
	events.SubscribeTyped(users.sub, events.ClientOffline, users.onUserOffline)

	gdf.users = users
	gdf.df.AttachTable(dfcore.DFPath("users"), users.table)
}

func (t *usersTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *usersTable) onUserCreated(payload events.UserUpdatedPayload) {
	t.table.PublishEntities(t.MakeCollection().Add(userEntity{
		id:   payload.User.ID,
		user: &payload.User,
	}))
}

func (t *usersTable) onUserUpdated(payload events.UserUpdatedPayload) {
	t.table.PublishEntities(t.MakeCollection().Add(userEntity{
		id:   payload.User.ID,
		user: &payload.User,
	}))
}

func (t *usersTable) onUserOnline(payload events.ClientConnected) {
	isOnline := true
	t.table.PublishEntities(t.MakeCollection().Add(userEntity{
		id:       payload.User.ID,
		isOnline: &isOnline,
	}))
}

func (t *usersTable) onUserOffline(payload events.ClientConnected) {
	isOnline := false
	t.table.PublishEntities(t.MakeCollection().Add(userEntity{
		id:       payload.User.ID,
		isOnline: &isOnline,
	}))
}

func (t *usersTable) queryByIds(
	req dfapi.DFTableRequest,
	_ domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	uids := make([]domain.UserID, 0, len(req.IDs))
	for _, uid := range req.IDs {
		uids = append(uids, domain.UserID(uid))
	}

	fetchedUsersById, err := t.repo.GetManyByIDs(uids)
	if err != nil {
		return nil, err
	}

	result := t.MakeCollection()
	for _, user := range fetchedUsersById {
		isOnline, err := t.tracker.IsOnline(user.ID)
		var isOnlineNullable *bool
		if err != nil {
			isOnlineNullable = &isOnline
		}
		result.Add(userEntity{
			id:       user.ID,
			user:     &user,
			isOnline: isOnlineNullable,
		})
	}

	return result, nil
}

func (t *usersTable) IdentifyEntity(u userEntity) domain.EntityID {
	return domain.EntityID(u.id)
}
func (t *usersTable) EncodeEntity(u userEntity) common.Encodable {
	if u.user != nil {
		return common.AsEncodable(api.UsersTableRow{
			ID:       string(u.id),
			Username: string(u.user.Username),
			Created:  u.user.Created,
			IsOnline: u.isOnline,
		})
	}

	return common.AsEncodable(api.UsersTableRow{
		ID:       string(u.id),
		IsOnline: u.isOnline,
	})
}
func (t *usersTable) MakeCollection() domain.EntityCollectionBuilder[userEntity] {
	return domain.MakeUnorderedEntityCollection(t, nil)
}

type userEntity struct {
	id       domain.UserID
	user     *domain.User
	isOnline *bool
}
