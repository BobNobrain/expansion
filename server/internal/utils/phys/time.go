package phys

type Time float64

func Seconds(s float64) Time {
	return Time(s)
}

func (t Time) Seconds() float64 {
	return float64(t)
}

type Age float64

func BillionYears(byrs float64) Age {
	return Age(byrs)
}

func (a Age) BillionYears() float64 {
	return float64(a)
}
