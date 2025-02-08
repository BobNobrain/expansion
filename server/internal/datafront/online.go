package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

type onlineSingleton struct {
	value   dfcore.QueryableSingleton
	sub     eb.Subscription
	tracker components.OnlinePresenceTracker
}

func (gdf *GameDataFront) InitOnline(tracker components.OnlinePresenceTracker) {
	online := &onlineSingleton{
		sub:     eb.CreateSubscription(),
		tracker: tracker,
	}
	online.value = dfcore.NewQueryableSingleton(online.getValue)

	eb.SubscribeTyped(online.sub, events.SourceComms, events.EventClientOffline, online.onOnlineChanged)
	eb.SubscribeTyped(online.sub, events.SourceComms, events.EventClientOffline, online.onOnlineChanged)

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

func (oc *onlineSingleton) onOnlineChanged(payload events.ClientConnected, _ eb.Event) {
	onlineCount, err := oc.tracker.GetOnlineCount()
	if err != nil {
		return
	}

	oc.value.PublishUpdate(common.AsEncodable(api.DFOnlineValue{
		Count: onlineCount,
	}))
}
