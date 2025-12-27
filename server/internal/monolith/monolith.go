package monolith

import (
	"fmt"
	"srv/internal/cheats"
	"srv/internal/components"
	"srv/internal/components/auth"
	"srv/internal/datafront"
	"srv/internal/db"
	"srv/internal/game/worldgen"
	"srv/internal/globals/config"
	"srv/internal/globals/logger"
	"srv/internal/transport/http"
	"srv/internal/transport/ws"
	"srv/internal/usecases"
)

type Monolith struct {
	// runner components.Runner
	store components.Storage
	gdf   *datafront.GameDataFront
}

func New() *Monolith {
	return &Monolith{}
}

func (m *Monolith) Start() error {
	store := db.NewDBStorage()
	m.store = store

	auth := auth.NewAuthenticator(store.Users())
	worldGen := worldgen.NewWorldGen(config.World().Seed)

	gdf := datafront.NewDataFront()
	m.gdf = gdf
	comms := ws.NewWebSocketComms(gdf)
	gdf.Run(comms)

	gdf.InitGalaxyMap()
	gdf.InitMeSingleton(store.Users())

	gdf.InitSysOverviews(store.Systems())
	gdf.InitSystems(store.Systems())
	gdf.InitWorldOverviews(store.Worlds())
	gdf.InitWorlds(store.Worlds())
	gdf.InitCities(store.Cities())
	gdf.InitBases(store.Bases(), store.Worlds())
	gdf.InitBaseOverviews(store.Bases())
	gdf.InitFactories(store)
	gdf.InitBaseEnvs(store.Factories(), store.Bases(), store.Worlds())

	gdf.InitUsers(store.Users(), comms)
	gdf.InitOnline(comms)

	gdf.InitCompanies(store.Companies())

	gdf.InitExploreActions(
		usecases.NewExploreSystemUsecase(worldGen, store),
		usecases.NewExploreWorldUsecase(worldGen, store),
	)
	gdf.InitCityActions(usecases.NewFoundCityUsecase(store))
	gdf.InitBaseActions(
		usecases.NewCreateBaseUsecase(store),
	)
	gdf.InitFactoryActions(
		usecases.NewCreateFactoryUsecase(store),
		usecases.NewUpgradeFactoryUsecase(store),
		usecases.NewRebalanceFactoryUsecase(store),
		usecases.NewContributeToFactoryUsecase(store),
	)

	if config.World().AllowCheats {
		gdf.InitCheatAction(usecases.NewCheatUsecase(store, cheats.NewCheatEngine()))
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

	m.gdf.Dispose()
	m.store.Dispose()
}
