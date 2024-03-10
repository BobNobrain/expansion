package srv

import (
	"fmt"
	"srv/internal/assets"
	"srv/internal/auth"
	"srv/internal/chats"
	"srv/internal/config"
	"srv/internal/db"
	"srv/internal/dispatcher"
	"srv/internal/domain"
	"srv/internal/gamerunner"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
)

func Run(cfg *config.SrvConfig) error {
	_, err := assets.Configure(cfg.AssetDir)
	if err != nil {
		return err
	}

	store := db.NewDBPermastore()
	err = store.Open(cfg)
	if err != nil {
		return err
	}

	userRepo := store.UserRepo()
	auth := auth.NewAuthenticator(userRepo, cfg)

	missionControl := dispatcher.NewDispatcher()
	comms := ws.NewWebSocketComms(missionControl, auth)
	missionControl.Start(comms)

	chatRepo := chats.NewChatRepo(comms, missionControl)
	// TODO
	chatRepo.CreateChat(&domain.ChatCreateData{
		Title:           "Global Chat",
		MemberUsernames: []domain.Username{"bob", "alice", "eve", "joe"},
	})

	galaxyContent, err := gamerunner.LoadGalaxyContent(store)
	if err != nil {
		return err
	}
	runner := gamerunner.NewGameRunner(missionControl, comms, store, galaxyContent)

	go runner.Run()

	// world := gameworld.NewGameWorld(cfg.WorldSeed, missionControl)
	// werr := world.LaunchSimulation()
	// if werr != nil {
	// 	return werr
	// }

	srv, err := http.NewHTTPServer(auth, comms, cfg)
	if err != nil {
		return err
	}

	fmt.Printf("Starting server at http://127.0.0.1:%s\n", cfg.Port)
	return srv.Run(":" + cfg.Port)
}
