package ws

import (
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/pkg/api"
	"sync"

	"github.com/gorilla/websocket"
)

type WSComms struct {
	mu         sync.Mutex
	dispatcher domain.Dispatcher

	clientsByUsername map[domain.Username][]*wsClient
	clientsById       map[domain.ClientID]*wsClient
}

func NewWebSocketComms(dispatcher domain.Dispatcher, auth domain.Authenticator) *WSComms {
	return &WSComms{
		mu:                sync.Mutex{},
		dispatcher:        dispatcher,
		clientsByUsername: make(map[domain.Username][]*wsClient),
		clientsById:       make(map[domain.ClientID]*wsClient),
	}
}

func (impl *WSComms) AsComms() domain.Comms {
	return impl
}

func (impl *WSComms) HandleNewConnection(conn *websocket.Conn, user *domain.User) {
	client := newClient(conn, user.Username, impl)
	impl.attachClient(client)
	impl.onOnlineCountChange()
}

func (impl *WSComms) Broadcast(rq domain.CommsBroadcastRequest) error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	message := &api.ServerEvent{
		Scope:   rq.Scope,
		Event:   rq.Event,
		Payload: rq.Payload,
	}

	if len(rq.Recepients) > 0 {
		for _, uname := range rq.Recepients {
			usersClients, found := impl.clientsByUsername[uname]
			if !found {
				continue
			}
			for _, client := range usersClients {
				client.send <- message
			}
		}
	} else {
		for _, client := range impl.clientsById {
			client.send <- message
		}
	}

	return nil
}

func (impl *WSComms) Respond(rq domain.CommsRespondRequest) error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	client, found := impl.clientsById[rq.ClientID]
	if !found {
		return nil
	}

	var message interface{} = nil
	if rq.Error != nil {
		message = &api.ServerCommandErrorResponse{
			ID:    rq.ResponseTo,
			Code:  "ERR_UNKNOWN",
			Error: rq.Error.Error(),
		}
	} else {
		message = &api.ServerCommandSuccessResponse{
			ID:     rq.ResponseTo,
			Result: rq.Result,
		}
	}

	client.send <- message
	return nil
}

func (impl *WSComms) attachClient(c *wsClient) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	impl.clientsById[c.id] = c
	impl.clientsByUsername[c.user] = append(impl.clientsByUsername[c.user], c)
}

func (impl *WSComms) detachClient(cid domain.ClientID) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	c, found := impl.clientsById[cid]
	if !found {
		return
	}

	delete(impl.clientsById, cid)

	allUserClients, wasRegistered := impl.clientsByUsername[c.user]
	if !wasRegistered {
		return
	}

	if len(allUserClients) > 1 {
		impl.clientsByUsername[c.user] = utils.FastRemove(allUserClients, c)
	} else {
		delete(impl.clientsByUsername, c.user)
	}
}
