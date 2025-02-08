package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

type meSingleton struct {
	value dfcore.QueryableSingleton
	users components.UserRepo
}

func (gdf *GameDataFront) InitMeSingleton(users components.UserRepo) {
	me := &meSingleton{
		users: users,
	}
	me.value = dfcore.NewQueryableSingleton(me.getValue)
	gdf.df.AttachSingleton("me", me.value)

	gdf.me = me
}

func (me *meSingleton) getValue(ctx dfcore.DFRequestContext) (common.Encodable, common.Error) {
	user, err := me.users.Get(components.GetUserRequest{
		UserID: ctx.OnBehalf,
	})

	if err != nil {
		return nil, err
	}

	return common.AsEncodable(api.MeSingletonValue{
		UserID:   string(user.ID),
		Username: string(user.Username),
		Created:  user.Created,
	}), nil
}
