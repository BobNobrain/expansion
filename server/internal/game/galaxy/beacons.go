package galaxy

import (
	"srv/internal/utils"
	"srv/internal/world"
)

func (g *gameGalaxy) loadBeacons() {
	top := utils.MakeTop[world.GalaxyBeacon](200)

	for _, systemState := range g.systemsById {
		for _, star := range systemState.GetStars() {
			beacon := world.GalaxyBeacon{
				StarID: star.ID,
				Params: star.Params,
				Coords: systemState.GetCoords(),
			}
			top.Insert(beacon, beacon.Rate())
		}
	}

	g.beacons = top.Get()
}

func (g *gameGalaxy) queryBeacons(maxCount int) []world.GalaxyBeacon {
	if maxCount >= len(g.beacons) {
		return g.beacons
	}
	return g.beacons[0:maxCount]
}
