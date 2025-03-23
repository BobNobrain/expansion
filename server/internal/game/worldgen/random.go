package worldgen

import (
	"math/rand"
	"srv/internal/game"
	"srv/internal/utils"
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

func (r *WorldRandom) ForStarSystem(sid game.StarSystemID) *rand.Rand {
	return utils.GetSeededRandom(r.seed + "::" + string(sid))
}

func (r *WorldRandom) ForCelestial(cid game.CelestialID) *rand.Rand {
	return utils.GetSeededRandom(r.seed + "::" + string(cid))
}

func (r *WorldRandom) ForGalaxySector(cid game.GalacticSectorID) *rand.Rand {
	return utils.GetSeededRandom(r.seed + "::" + string(cid))
}
