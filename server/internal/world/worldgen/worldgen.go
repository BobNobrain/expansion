package worldgen

type WorldGen struct {
	rnd *WorldRandom
}

func NewWorldGen(seed string) *WorldGen {
	return &WorldGen{
		rnd: NewWorldRandom(seed),
	}
}

func (wg *WorldGen) GetRandom() *WorldRandom {
	return wg.rnd
}
