package worldgen

import "srv/internal/utils/phys"

type Icelines struct {
	Silicate phys.Distance
	Water    phys.Distance
	CO       phys.Distance
}

func EstimateIcelines(t phys.Temperature, r phys.Distance) Icelines {
	return Icelines{
		Silicate: dumbIcelineEstimate(t, r, phys.Kelvins(1400)),
		Water:    dumbIcelineEstimate(t, r, phys.Kelvins(170)),
		CO:       dumbIcelineEstimate(t, r, phys.Kelvins(30)),
	}
}
