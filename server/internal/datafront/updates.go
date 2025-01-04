package datafront

import (
	"srv/internal/components"
	"srv/internal/domain"
)

func (d *DataFront) notifyUpdated(patch DFUpdatePatch, clients []domain.ClientID) {
	d.comms.Broadcast(components.CommsBroadcastRequest{
		Scope:            d.scope,
		Event:            "update",
		RecipientClients: clients,
		Payload: DFUpdateEvent{
			// TODO: batch up updates
			Patches: []DFUpdatePatch{patch},
		},
	})
}
