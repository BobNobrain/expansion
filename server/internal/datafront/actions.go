package datafront

import (
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/pkg/api"
)

type gameActions struct {
	gmap game.GalaxyMap
}

func (gdf *GameDataFront) InitExploreActions(gmap game.GalaxyMap) {
	if gdf.actions == nil {
		gdf.actions = &gameActions{}
	}
	gdf.actions.gmap = gmap

	gdf.df.AttachAction(api.ActionExploreSystem, dfcore.NewAction(gdf.actions.handleExploreSystem))
	gdf.df.AttachAction(api.ActionExploreWorld, dfcore.NewAction(gdf.actions.handleExploreWorld))
}

func (a *gameActions) handleExploreSystem(payload api.ExploreSystemPayload, userID domain.UserID) (common.Encodable, common.Error) {
	err := a.gmap.ExploreSystem(world.StarSystemID(payload.SystemID), userID)
	return common.EmptyEncodable(), err
}

func (a *gameActions) handleExploreWorld(payload api.ExploreWorldPayload, userID domain.UserID) (common.Encodable, common.Error) {
	err := a.gmap.ExploreWorld(world.CelestialID(payload.WorldID), userID)
	return common.EmptyEncodable(), err
}
