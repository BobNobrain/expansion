package http

import (
	"net/http"
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
		auth, err := checkTokenCookie(r, srv.auth)

		if err != nil {
			respondJson(w, http.StatusUnauthorized, transport.NewUnauthorizedError())
		}

		connection, _ := upgrader.Upgrade(w, r, nil)
		srv.comms.HandleNewConnection(connection, auth.User)
	})
}
