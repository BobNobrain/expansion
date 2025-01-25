package monolith

import (
	"fmt"
	"srv/internal/components/auth"
	"srv/internal/components/dispatcher"
	"srv/internal/datafront"
	"srv/internal/db"
	"srv/internal/globals/config"
	"srv/internal/globals/logger"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
	"srv/internal/world/worldgen"
)

type Monolith struct {
	// runner components.Runner
	store *db.Storage
	gdf   *datafront.GameDataFront
}

func New() *Monolith {
	return &Monolith{}
}

func (m *Monolith) Start() error {
	store := db.NewDBPermastore()
	m.store = store

	userRepo := store.UserRepo()
	auth := auth.NewAuthenticator(userRepo)

	missionControl := dispatcher.NewDispatcher()
	comms := ws.NewWebSocketComms(missionControl, auth, userRepo)
	missionControl.Start(comms)

	worldGen := worldgen.NewWorldGen(config.World().Seed)

	gdf := datafront.NewDataFront(missionControl, comms)
	m.gdf = gdf
	gdf.InitGalaxyMap()
	gdf.InitOnline(comms)
	gdf.InitUsers(userRepo, comms)

	// m.runner = gameInstance

	// err := m.runner.Start()
	// if err != nil {
	// 	return err
	// }

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

	// err := m.runner.Stop()
	// if err != nil {
	// 	logger.Error(logger.FromError("monolith", err))
	// }

	m.gdf.Dispose()
	m.store.Dispose()
}
