package ws

import (
	"encoding/json"
	"fmt"
	"srv/internal/domain"
	"srv/pkg/api"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait        = 10 * time.Second
	pongWait         = 60 * time.Second
	pingPeriod       = (pongWait * 9) / 10
	maxMessageSize   = 4096
	maxSendQueueSize = 32
)

func handleNewConnection(client *wsClient) {
	client.conn.SetReadLimit(maxMessageSize)
	client.conn.SetReadDeadline(time.Now().Add(pongWait))
	client.conn.SetPongHandler(func(string) error {
		client.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	go client.handleInbox()
	go client.handleOutbox()
}

func (c *wsClient) handleInbox() {
	defer c.kick()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				fmt.Printf("error: %v", err)
			}
			break
		}

		var parsed = api.ClientCommand{}
		err = json.Unmarshal(message, &parsed)

		if err != nil {
			// unparseable JSON, let's just drop this connection
			break
		}

		c.hub.dispatcher.EnqueueForDispatching(&domain.DispatcherCommand{
			ID:       domain.DispatcherCommandID(parsed.ID),
			ClientID: c.id,
			OnBehalf: c.user,
			Scope:    domain.DispatcherScope(parsed.Scope),
			Command:  parsed.Command,
			Payload:  parsed.Payload,
		})
	}
}

func (c *wsClient) handleOutbox() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.kick()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			bytes, err := json.Marshal(message)

			if err != nil {
				fmt.Printf("error jsoning: %v", err)
				continue
			}

			err = c.conn.WriteMessage(websocket.TextMessage, bytes)
			if err != nil {
				fmt.Printf("error writing: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
