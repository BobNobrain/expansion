package phys

type Pressure float64

func Bar(b float64) Pressure {
	return Pressure(b)
}
func Pascals(pa float64) Pressure {
	return Pressure(pa * 1e-5)
}

func (p Pressure) Bar() float64 {
	return float64(p)
}
