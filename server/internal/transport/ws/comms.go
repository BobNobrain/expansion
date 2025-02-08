package ws

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
	"sync"

	"github.com/gorilla/websocket"
)

type WSComms struct {
	mu *sync.Mutex
	df components.DataFront

	clientsByUserID map[domain.UserID][]*wsClient
	clientsById     map[domain.ClientID]*wsClient
	users           components.UserRepo
}

func NewWebSocketComms(df components.DataFront) *WSComms {
	return &WSComms{
		mu:              new(sync.Mutex),
		df:              df,
		clientsByUserID: make(map[domain.UserID][]*wsClient),
		clientsById:     make(map[domain.ClientID]*wsClient),
	}
}

func (impl *WSComms) AsComms() components.Comms {
	return impl
}

func (impl *WSComms) HandleNewConnection(conn *websocket.Conn, user domain.User) {
	client := newClient(conn, user, impl)
	impl.attachClient(client)

	eb.PublishNew(events.SourceComms, events.EventClientOnline, events.ClientConnected{User: user, CliendID: client.id})
}

func (impl *WSComms) Broadcast(rq components.CommsBroadcastRequest) common.Error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	message := dfapi.DFGenericEvent{
		Event:   rq.Event,
		Payload: rq.Payload.Encode(),
	}

	if len(rq.Recepients) > 0 {
		for _, uid := range rq.Recepients {
			usersClients, found := impl.clientsByUserID[uid]
			if !found {
				continue
			}
			for _, client := range usersClients {
				client.send <- message
			}
		}
	} else if len(rq.RecipientClients) > 0 {
		for _, clientId := range rq.RecipientClients {
			client, found := impl.clientsById[clientId]
			if !found {
				continue
			}
			client.send <- message
		}
	} else {
		for _, client := range impl.clientsById {
			client.send <- message
		}
	}

	return nil
}

func (impl *WSComms) attachClient(c *wsClient) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	impl.clientsById[c.id] = c
	impl.clientsByUserID[c.user.ID] = append(impl.clientsByUserID[c.user.ID], c)
}

func (impl *WSComms) detachClient(cid domain.ClientID) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	c, found := impl.clientsById[cid]
	if !found {
		return
	}

	delete(impl.clientsById, cid)

	allUserClients, wasRegistered := impl.clientsByUserID[c.user.ID]
	if !wasRegistered {
		return
	}

	if len(allUserClients) > 1 {
		impl.clientsByUserID[c.user.ID] = utils.FastRemove(allUserClients, c)
	} else {
		delete(impl.clientsByUserID, c.user.ID)
	}

	eb.PublishNew(events.SourceComms, events.EventClientOffline, events.ClientConnected{User: c.user, CliendID: cid})
}
