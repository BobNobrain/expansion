package http

import (
	"net/http"
	"srv/internal/globals/logger"
	"srv/internal/transport"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (srv *httpServerImpl) serveSocket() {
	srv.server.HandleFunc("/sock", func(w http.ResponseWriter, r *http.Request) {
		logger.Info(logger.FromMessage("ws", "receivied a connection request"))
		auth, err := checkTokenCookie(r, srv.auth)

		logger.Info(logger.FromMessage("ws", "auth checked"))
		if err != nil {
			logger.Info(logger.FromMessage("ws", "auth failed"))
			respondJson(w, http.StatusUnauthorized, transport.NewUnauthorizedError())
			return
		}

		connection, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			logger.Warn(logger.FromUnknownError("ws", err).WithDetail("operation", "upgrade"))
		}
		logger.Info(logger.FromMessage("ws", "upgraded"))
		srv.comms.HandleNewConnection(connection, *auth.User)
	})
}
