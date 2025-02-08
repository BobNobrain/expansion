package monolith

import (
	"fmt"
	"srv/internal/components/auth"
	"srv/internal/datafront"
	"srv/internal/db"
	"srv/internal/game/galaxymap"
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

	worldGen := worldgen.NewWorldGen(config.World().Seed)
	gmap := galaxymap.New(galaxymap.GalaxyMapOptions{
		WorldGen:    worldGen,
		StarSystems: store.StarSystemsRepo(),
		Worlds:      store.WorldsRepo(),
	})

	gdf := datafront.NewDataFront()
	m.gdf = gdf
	comms := ws.NewWebSocketComms(gdf)
	gdf.Run(comms)

	gdf.InitGalaxyMap()
	gdf.InitMeSingleton(userRepo)

	gdf.InitSysOverviews(store.StarSystemsRepo())
	gdf.InitSystems(store.StarSystemsRepo())
	gdf.InitWorldOverviews(store.WorldsRepo())
	gdf.InitWorlds(store.WorldsRepo())

	gdf.InitUsers(userRepo, comms)
	gdf.InitOnline(comms)

	gdf.InitExploreActions(gmap)
	// gdf.InitCityActions(store.CitiesRepo())
	// gdf.InitBaseActions(...)

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

	m.gdf.Dispose()
	m.store.Dispose()
}
