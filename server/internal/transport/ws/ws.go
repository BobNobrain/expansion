package ws

import (
	"encoding/json"
	"fmt"
	"srv/internal/components"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
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
				logger.Error(logger.FromError("ws", common.NewUnknownError(err)))
			}
			break
		}

		var parsed dfapi.DFGenericRequest
		err = json.Unmarshal(message, &parsed)

		if err != nil {
			// unparseable JSON, let's just drop this connection
			break
		}

		result, dferr := c.hub.df.HandleRequest(components.DataFrontRequest{
			ID:       components.DataFrontRequestID(parsed.ID),
			ClientID: c.id,
			OnBehalf: c.user.ID,
			Type:     parsed.Type,
			Received: time.Now(),
			Request:  parsed.Request,
		})

		if dferr != nil {
			var detailsEncoded any
			if details := dferr.Details(); details != nil {
				detailsEncoded = details.Encode()
			}
			c.send <- dfapi.DFGenericResponse{
				RequestID: parsed.ID,
				Error: &dfapi.DFError{
					Code:        dferr.Code(),
					Message:     dferr.Error(),
					IsRetriable: dferr.IsRetriable(),
					Details:     detailsEncoded,
				},
			}
			continue
		}

		if result != nil {
			c.send <- dfapi.DFGenericResponse{
				RequestID: parsed.ID,
				Result:    result.Encode(),
			}
		}

		// otherwise no action is needed
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
				logger.Warn(
					logger.FromUnknownError("ws", err).
						WithDetail("msg", fmt.Sprintf("%v", message)).
						WithDetail("source", "json"),
				)
				continue
			}

			err = c.conn.WriteMessage(websocket.TextMessage, bytes)
			if err != nil {
				logger.Info(
					logger.FromUnknownError("ws", err).
						WithDetail("msg", fmt.Sprintf("%v", message)).
						WithDetail("source", "write"),
				)
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
