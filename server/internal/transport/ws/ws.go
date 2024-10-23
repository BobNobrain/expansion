package ws

import (
	"encoding/json"
	"fmt"
	"srv/internal/components"
	"srv/internal/globals/logger"
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

		c.hub.dispatcher.EnqueueForDispatching(&components.DispatcherCommand{
			ID:       components.DispatcherCommandID(parsed.ID),
			ClientID: c.id,
			OnBehalf: c.user,
			Scope:    components.DispatcherScope(parsed.Scope),
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
				if msg, ok := message.(*api.ServerCommandSuccessResponse); ok {
					logger.Warn(logger.FromMessage("ws", "json failure").WithDetail("msg", fmt.Sprintf("%+v", msg.Result)))
				}
				logger.Warn(logger.FromUnknownError("ws", err).WithDetail("msg", fmt.Sprintf("%v", message)).WithDetail("source", "json"))
				continue
			}

			err = c.conn.WriteMessage(websocket.TextMessage, bytes)
			if err != nil {
				logger.Info(logger.FromUnknownError("ws", err).WithDetail("msg", fmt.Sprintf("%v", message)).WithDetail("source", "write"))
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
