package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

type onlineSingleton struct {
	value   dfcore.QueryableSingleton
	sub     *events.Subscription
	tracker components.OnlinePresenceTracker
}

func (gdf *GameDataFront) InitOnline(tracker components.OnlinePresenceTracker) {
	online := &onlineSingleton{
		sub:     events.NewSubscription(),
		tracker: tracker,
	}
	online.value = dfcore.NewQueryableSingleton(online.getValue)

	events.SubscribeTyped(online.sub, events.ClientOnline, online.onOnlineChanged)
	events.SubscribeTyped(online.sub, events.ClientOffline, online.onOnlineChanged)

	gdf.online = online
	gdf.df.AttachSingleton(dfcore.DFPath("online"), online.value)
}

func (oc *onlineSingleton) dispose() {
	oc.sub.UnsubscribeAll()
}

func (oc *onlineSingleton) getValue(_ dfcore.DFRequestContext) (common.Encodable, common.Error) {
	onlineCount, err := oc.tracker.GetOnlineCount()
	if err != nil {
		return nil, err
	}

	return common.AsEncodable(api.DFOnlineValue{
		Count: onlineCount,
	}), nil
}

func (oc *onlineSingleton) onOnlineChanged(payload events.ClientConnected) {
	onlineCount, err := oc.tracker.GetOnlineCount()
	if err != nil {
		return
	}

	oc.value.PublishUpdate(common.AsEncodable(api.DFOnlineValue{
		Count: onlineCount,
	}))
}
