package ws

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"sync"

	"github.com/gorilla/websocket"
)

type WSComms struct {
	mu         sync.Mutex
	dispatcher components.Dispatcher

	clientsByUsername map[domain.Username][]*wsClient
	clientsById       map[domain.ClientID]*wsClient
}

func NewWebSocketComms(dispatcher components.Dispatcher, auth components.Authenticator) *WSComms {
	return &WSComms{
		mu:                sync.Mutex{},
		dispatcher:        dispatcher,
		clientsByUsername: make(map[domain.Username][]*wsClient),
		clientsById:       make(map[domain.ClientID]*wsClient),
	}
}

func (impl *WSComms) AsComms() components.Comms {
	return impl
}

const userDataScopeName = components.DispatcherScope("user")

func (impl *WSComms) HandleNewConnection(conn *websocket.Conn, user *domain.User) {
	client := newClient(conn, user.Username, impl)
	impl.attachClient(client)
	impl.onOnlineCountChange()

	impl.Broadcast(components.CommsBroadcastRequest{
		Scope:   userDataScopeName,
		Event:   "login",
		Payload: encodables.NewUserDataUpdatePayload(user.Username),
	})
}

func (impl *WSComms) Broadcast(rq components.CommsBroadcastRequest) common.Error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	message := &api.ServerEvent{
		Scope:   string(rq.Scope),
		Event:   rq.Event,
		Payload: rq.Payload.Encode(),
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

func (impl *WSComms) Respond(rq components.CommsRespondRequest) common.Error {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	client, found := impl.clientsById[rq.ClientID]
	if !found {
		return nil
	}

	var message interface{} = nil
	if rq.Error != nil {
		message = &api.ServerCommandErrorResponse{
			ID:    uint64(rq.ResponseTo),
			Code:  "ERR_UNKNOWN",
			Error: rq.Error.Error(),
		}
	} else {
		message = &api.ServerCommandSuccessResponse{
			ID:     uint64(rq.ResponseTo),
			Result: rq.Result.Encode(),
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
