package phys

type Speed float64

func KilometersPerSecond(kmps float64) Speed {
	return Speed(kmps)
}
func FromDistanceAndTime(d Distance, t PhysicalTime) Speed {
	return Speed(d.Kilometers() / t.Seconds())
}

func (s Speed) KilometersPerSecond() float64 {
	return float64(s)
}

type Acceleration float64

func KilometersPerSecondSquared(kmpss float64) Acceleration {
	return Acceleration(kmpss)
}
func (a Acceleration) KilometersPerSecondSquared() float64 {
	return float64(a)
}
func (a Acceleration) EarthGs() float64 {
	return float64(a) * 1e2
}
