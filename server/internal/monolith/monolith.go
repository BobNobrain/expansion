package monolith

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/components/auth"
	"srv/internal/components/dispatcher"
	"srv/internal/db"
	"srv/internal/game"
	"srv/internal/game/galaxymap"
	"srv/internal/globals/config"
	"srv/internal/globals/logger"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
	"srv/internal/world/worldgen"
)

type Monolith struct {
	runner components.Runner
	store  *db.Storage
}

func New() *Monolith {
	return &Monolith{}
}

func (m *Monolith) Start() error {
	store := db.NewDBPermastore()
	m.store = store
	err := store.Open()
	if err != nil {
		return err
	}

	userRepo := store.UserRepo()
	auth := auth.NewAuthenticator(userRepo)

	missionControl := dispatcher.NewDispatcher()
	comms := ws.NewWebSocketComms(missionControl, auth, userRepo)
	missionControl.Start(comms)

	// chatRepo := chats.NewChatRepo(comms, missionControl)
	// // TODO
	// chatRepo.CreateChat(&domain.ChatCreateData{
	// 	Title:           "Global Chat",
	// 	MemberUsernames: []domain.Username{"bob", "alice", "eve", "joe"},
	// })

	worldGen := worldgen.NewWorldGen(config.World().Seed)

	gameInstance := game.New(game.GameComponents{
		Dispatcher: missionControl,
		GalaxyMap: galaxymap.New(galaxymap.GalaxyMapOptions{
			WorldGen:    worldGen,
			StarSystems: store.StaticStarSystemData(),
			Precalcs:    store.PrecalculatedBlobs(),
			Dispatcher:  missionControl,
		}),
	})

	m.runner = gameInstance

	err = m.runner.Start()
	if err != nil {
		return err
	}

	srv, herr := http.NewHTTPServer(auth, comms)
	if herr != nil {
		return herr
	}

	port := config.HTTP().Port
	logger.Info(logger.FromMessage("monolith", fmt.Sprintf("Starting server at http://127.0.0.1:%s\n", port)))
	return srv.Run(":" + port)
}

func (m *Monolith) Stop() {
	logger.Warn(logger.FromMessage("monolith", "Stopping the server..."))

	err := m.runner.Stop()
	if err != nil {
		logger.Error(logger.FromError("monolith", err))
	}

	err = m.store.Close()
	if err != nil {
		logger.Error(logger.FromError("monolith", err))
	}
}
