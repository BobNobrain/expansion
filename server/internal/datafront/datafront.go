package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
)

const gameDataFrontScope components.DispatcherScope = "gdf"

type GameDataFront struct {
	df *dfcore.DataFront

	users  *usersTable
	online *onlineSingleton
	galaxy *galaxyMapSingleton
}

func NewDataFront(disp components.Dispatcher, comms components.Comms) *GameDataFront {
	result := &GameDataFront{
		df: dfcore.NewDataFront(disp, comms, gameDataFrontScope),
	}

	return result
}

func (gdf *GameDataFront) Dispose() {
	gdf.users.dispose()
	gdf.online.dispose()

	gdf.df.Dispose()
}
