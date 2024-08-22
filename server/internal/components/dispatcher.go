package components

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type Dispatcher interface {
	EnqueueForDispatching(*DispatcherCommand)
	RegisterHandler(DispatcherCommandHandler)
}

type DispatcherCommandID uint64

type DispatcherScope string

type DispatcherCommandHandler interface {
	GetScope() DispatcherScope
	HandleCommand(*DispatcherCommand) (common.Encodable, common.Error)
}

type DispatcherCommand struct {
	ID       DispatcherCommandID
	ClientID domain.ClientID
	OnBehalf domain.User
	Scope    DispatcherScope
	Command  string
	Payload  json.RawMessage
}
