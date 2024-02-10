package phys

type Time float64

func Seconds(s float64) Time {
	return Time(s)
}

func (t Time) Seconds() float64 {
	return float64(t)
}
