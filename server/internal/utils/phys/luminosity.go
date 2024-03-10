package phys

type Luminosity float64

const solarLuminosityWatts = 3.828e26

func LuminositySuns(lsuns float64) Luminosity {
	return Luminosity(lsuns)
}

func (l Luminosity) Suns() float64 {
	return float64(l)
}

func (l Luminosity) Watts() float64 {
	return float64(l) * solarLuminosityWatts
}
