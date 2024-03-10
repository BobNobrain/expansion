package ws

import (
	"srv/internal/components"
	"srv/internal/encodables"
)

const scopeName = components.DispatcherScope("online")

func (impl *WSComms) onOnlineCountChange() {
	c, err := impl.GetOnlineCount()
	if err != nil {
		return
	}

	impl.Broadcast(components.CommsBroadcastRequest{
		Scope:   scopeName,
		Event:   "change",
		Payload: encodables.NewOnlineCountChangePayload(c),
	})
}
