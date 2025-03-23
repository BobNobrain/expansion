package worldgen

import (
	"srv/internal/game"
	"srv/internal/globals/logger"
)

type GeneratedStarSystemData struct {
	SystemID   game.StarSystemID
	Coords     game.GalacticCoords
	Stars      []game.Star
	Orbits     map[game.CelestialID]game.OrbitData
	Bodies     map[game.CelestialID]GeneratedCelestialData
	NPlanets   int
	NMoons     int
	NAsteroids int
}

const CelestialBodyLevelPlanet = 0

type GeneratedCelestialData struct {
	ID     game.CelestialID
	Params game.WorldParams
	Level  int
	Size   int
}

func (ctx *GeneratedStarSystemData) placeCelestial(body GeneratedCelestialData, orbit game.OrbitData) {
	logger.Debug(logger.FromMessage("worldgen", "system celestial generated").WithDetail("id", body.ID).WithDetail("avg d", orbit.Ellipse.AverageDistance().AstronomicalUnits()))

	ctx.Bodies[body.ID] = body
	ctx.Orbits[body.ID] = orbit

	if body.ID.IsPlanetID() {
		ctx.NPlanets++
	} else if body.ID.IsMoonID() {
		ctx.NMoons++
	}
}

func (ctx *GeneratedStarSystemData) removeCelestial(cid game.CelestialID) {
	delete(ctx.Bodies, cid)
	delete(ctx.Orbits, cid)
}
