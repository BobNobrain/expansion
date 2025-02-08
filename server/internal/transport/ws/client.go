package ws

import (
	"srv/internal/domain"

	"github.com/gorilla/websocket"
)

type wsClient struct {
	id   domain.ClientID
	user domain.User
	conn *websocket.Conn
	send chan interface{}
	hub  *WSComms
}

func newClient(conn *websocket.Conn, user domain.User, hub *WSComms) *wsClient {
	client := &wsClient{
		id:   domain.NewClientID(),
		user: user,
		conn: conn,
		send: make(chan interface{}, maxSendQueueSize),
		hub:  hub,
	}

	handleNewConnection(client)

	return client
}

func (wsc *wsClient) kick() error {
	errW := wsc.conn.WriteMessage(websocket.CloseMessage, []byte{})
	errC := wsc.conn.Close()

	wsc.hub.detachClient(wsc.id)

	if errW != nil {
		return errW
	}
	return errC
}
