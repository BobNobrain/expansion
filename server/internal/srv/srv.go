package srv

import (
	"fmt"
	"srv/internal/chats"
	"srv/internal/dispatcher"
	"srv/internal/domain"
	"srv/internal/stubs"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
)

func Run() error {
	userRepo := stubs.NewStubUserRepo()
	auth := stubs.NewStubAuthenticator(userRepo)

	missionControl := dispatcher.NewDispatcher()
	comms := ws.NewWebSocketComms(missionControl, auth)
	missionControl.Start(comms)

	chatRepo := chats.NewChatRepo(comms, missionControl)
	chatRepo.CreateChat(&domain.ChatCreateData{
		Title:           "Global Chat",
		MemberUsernames: []domain.Username{"bob", "alice", "eve", "joe"},
	})

	srv := http.NewHTTPServer(auth, comms)

	fmt.Println("Starting server at http://127.0.0.1:8031")
	return srv.Run(":8031")
}
