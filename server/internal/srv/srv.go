package srv

import (
	"fmt"
	"srv/internal/chats"
	"srv/internal/config"
	"srv/internal/dispatcher"
	"srv/internal/domain"
	"srv/internal/stubs"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
	"srv/internal/world/gameworld"
)

func Run(cfg *config.SrvConfig) error {
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

	world := gameworld.NewGameWorld(cfg.WorldSeed, missionControl)
	werr := world.LaunchSimulation()
	if werr != nil {
		return werr
	}

	srv, err := http.NewHTTPServer(auth, comms, cfg)
	if err != nil {
		return err
	}

	fmt.Printf("Starting server at http://127.0.0.1:%s\n", cfg.Port)
	return srv.Run(":" + cfg.Port)
}
