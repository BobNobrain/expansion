package srv

import (
	"fmt"
	"srv/internal/dispatcher"
	"srv/internal/stubs"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
)

func Run() error {
	userRepo := stubs.NewStubUserRepo()
	auth := stubs.NewStubAuthenticator(userRepo)
	missionControl := dispatcher.NewDispatcher()
	comms := ws.NewWebSocketComms(missionControl, auth)

	srv := http.NewHTTPServer(auth, comms)

	fmt.Println("Starting server at http://127.0.0.1:8031")
	return srv.Run(":8031")
}
