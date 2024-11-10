package worldgen

import (
	"srv/internal/globals/logger"
	"srv/internal/world"
)

type GeneratedStarSystemData struct {
	SystemID world.StarSystemID
	Coords   world.GalacticCoords
	Stars    []*world.Star
	Orbits   map[world.CelestialID]world.OrbitData
	Bodies   map[world.CelestialID]GeneratedCelestialData
}

const CelestialBodyLevelPlanet = 0

type GeneratedCelestialData struct {
	ID     world.CelestialID
	Params world.CelestialSurfaceParams
	Level  int
}

func (ctx *GeneratedStarSystemData) placeCelestial(body GeneratedCelestialData, orbit world.OrbitData) {
	logger.Debug(logger.FromMessage("worldgen", "system celestial generated").WithDetail("id", body.ID).WithDetail("avg d", orbit.Ellipse.AverageDistance().AstronomicalUnits()))

	ctx.Bodies[body.ID] = body
	ctx.Orbits[body.ID] = orbit
}

func (ctx *GeneratedStarSystemData) removeCelestial(cid world.CelestialID) {
	delete(ctx.Bodies, cid)
	delete(ctx.Orbits, cid)
}
