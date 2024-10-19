package worldgen

import "srv/internal/world"

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
	ctx.Bodies[body.ID] = body
	ctx.Orbits[body.ID] = orbit
}

func (ctx *GeneratedStarSystemData) removeCelestial(cid world.CelestialID) {
	delete(ctx.Bodies, cid)
	delete(ctx.Orbits, cid)
}
