package ws

import (
	"srv/internal/domain"
)

func (impl *WSComms) AsCommandHandler() domain.DispatcherCommandHandler {
	return impl
}

const scopeName = domain.DispatcherScope("online")

func (impl *WSComms) GetScope() domain.DispatcherScope {
	return scopeName
}

func (impl *WSComms) HandleCommand(cmd *domain.DispatcherCommand) error {
	return domain.NewUnknownDispatcherCommandError(cmd)
}

type onlineChangePayload struct {
	Count int `json:"count"`
}

func (impl *WSComms) onOnlineCountChange() {
	c, err := impl.GetOnlineCount()
	if err != nil {
		return
	}

	impl.Broadcast(domain.CommsBroadcastRequest{
		Scope:   scopeName,
		Event:   "change",
		Payload: &onlineChangePayload{Count: c},
	})
}
