package ws

import (
	"srv/internal/domain"
	"srv/internal/encodables"
)

const scopeName = domain.DispatcherScope("online")

func (impl *WSComms) onOnlineCountChange() {
	c, err := impl.GetOnlineCount()
	if err != nil {
		return
	}

	impl.Broadcast(domain.CommsBroadcastRequest{
		Scope:   scopeName,
		Event:   "change",
		Payload: encodables.NewOnlineCountChangePayload(c),
	})
}
