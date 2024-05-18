package worldgen

import (
	"math/rand"
	"srv/internal/utils"
	"srv/internal/world"
)

type WorldRandom struct {
	seed string
}

func NewWorldRandom(seed string) *WorldRandom {
	return &WorldRandom{seed: seed}
}

func (r *WorldRandom) Global() *rand.Rand {
	return utils.GetSeededRandom(r.seed)
}

func (r *WorldRandom) ForStarSystem(sid world.StarSystemID) *rand.Rand {
	return utils.GetSeededRandom(r.seed + "::" + string(sid))
}

func (r *WorldRandom) ForCelestial(cid world.CelestialID) *rand.Rand {
	return utils.GetSeededRandom(r.seed + "::" + string(cid))
}

func (r *WorldRandom) ForGalaxySector(cid world.GalacticSectorID) *rand.Rand {
	return utils.GetSeededRandom(r.seed + "::" + string(cid))
}
