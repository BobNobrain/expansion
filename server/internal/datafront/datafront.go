package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/utils/common"
)

type GameDataFront struct {
	df *dfcore.DataFront

	online *onlineSingleton
	galaxy *galaxyMapSingleton
	me     *meSingleton

	systems *systemsTable
	users   *usersTable
	worlds  *worldsTable
	cities  *citiesTable

	sysOverviews   *sysOverviewsTable
	worldOverviews *worldOverviewsTable

	actions *gameActions
}

func NewDataFront() *GameDataFront {
	result := &GameDataFront{
		df: dfcore.NewDataFront(),
	}

	return result
}

func (gdf *GameDataFront) Run(comms components.Comms) {
	gdf.df.Run(comms)
}

func (gdf *GameDataFront) Dispose() {
	gdf.users.dispose()
	gdf.online.dispose()

	gdf.systems.dispose()
	gdf.sysOverviews.dispose()
	gdf.worldOverviews.dispose()
	gdf.worlds.dispose()
	gdf.cities.dispose()

	gdf.df.Dispose()
}

func (gdf *GameDataFront) HandleRequest(rq components.DataFrontRequest) (common.Encodable, common.Error) {
	return gdf.df.HandleRequest(rq)
}
