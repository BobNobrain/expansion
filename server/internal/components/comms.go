package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type Comms interface {
	Broadcast(CommsBroadcastRequest) common.Error
}

type CommsBroadcastRequest struct {
	Event            string
	Recepients       []domain.UserID
	RecipientClients []domain.ClientID
	Payload          common.Encodable
}
