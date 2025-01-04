package ws

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"sync"

	"github.com/gorilla/websocket"
)

type WSComms struct {
	mu         sync.Mutex
	dispatcher components.Dispatcher

	clientsByUserID map[domain.UserID][]*wsClient
	clientsById     map[domain.ClientID]*wsClient
	users           components.UserRepo
}

func NewWebSocketComms(
	dispatcher components.Dispatcher,
	auth components.Authenticator,
	userRepo components.UserRepo,
) *WSComms {
	return &WSComms{
		mu:              sync.Mutex{},
		dispatcher:      dispatcher,
		clientsByUserID: make(map[domain.UserID][]*wsClient),
		clientsById:     make(map[domain.ClientID]*wsClient),
	}
}

func (impl *WSComms) AsComms() components.Comms {
	return impl
}

const userDataScopeName = components.DispatcherScope("user")

func (impl *WSComms) HandleNewConnection(conn *websocket.Conn, user domain.User) {
	client := newClient(conn, user, impl)
	impl.attachClient(client)
	impl.onOnlineCountChange()

	impl.Broadcast(components.CommsBroadcastRequest{
		Scope:            userDataScopeName,
		Event:            "login",
		RecipientClients: []domain.ClientID{client.id},
		Payload:          encodables.NewUserDataUpdatePayload(user.Username),
	})

	eb.PublishNew("comms", "online", events.ClientConnected{User: user, CliendID: client.id})
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
			ID:      uint64(rq.ResponseTo),
			Code:    rq.Error.Code(),
			Error:   rq.Error.Error(),
			Details: rq.Error.Details().Encode(),
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

	eb.PublishNew("comms", "offline", events.ClientConnected{User: c.user, CliendID: cid})
}
