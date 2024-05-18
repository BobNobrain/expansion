package world

type MaterialID int16

type CelestialBodyComposition struct {
	components map[MaterialID]float64
	total      float64
}

func NewCelestialBodyComposition() *CelestialBodyComposition {
	return &CelestialBodyComposition{
		components: make(map[MaterialID]float64),
		total:      0,
	}
}

func (c *CelestialBodyComposition) Add(mat MaterialID, share float64) {
	c.components[mat] = share
	c.total += share
}

func (c *CelestialBodyComposition) GetMaterials() []MaterialID {
	ids := make([]MaterialID, 0, len(c.components))
	for si := range c.components {
		ids = append(ids, si)
	}
	return ids
}

func (c *CelestialBodyComposition) GetShare(id MaterialID) float64 {
	return c.components[id] / c.total
}
