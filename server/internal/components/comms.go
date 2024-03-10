package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type Comms interface {
	Broadcast(CommsBroadcastRequest) common.Error
	Respond(CommsRespondRequest) common.Error
}

type CommsBroadcastRequest struct {
	Scope            DispatcherScope
	Event            string
	Recepients       []domain.Username
	RecipientClients []domain.ClientID
	Payload          common.Encodable
}

type CommsRespondRequest struct {
	ClientID   domain.ClientID
	ResponseTo DispatcherCommandID
	Error      common.Error
	Result     common.Encodable
}
