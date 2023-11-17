package domain

import (
	"srv/internal/utils/common"
)

type Comms interface {
	Broadcast(CommsBroadcastRequest) common.Error
	Respond(CommsRespondRequest) common.Error
}

type CommsBroadcastRequest struct {
	Scope            DispatcherScope
	Event            string
	Recepients       []Username
	RecipientClients []ClientID
	Payload          common.Encodable
}

type CommsRespondRequest struct {
	ClientID   ClientID
	ResponseTo DispatcherCommandID
	Error      common.Error
	Result     common.Encodable
}
