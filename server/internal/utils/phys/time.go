package phys

import "time"

type PhysicalTime float64

const secondsPerMonth float64 = 60 * 60 * 24 * 30

func Seconds(s float64) PhysicalTime {
	return PhysicalTime(s / secondsPerMonth)
}
func Months(m float64) PhysicalTime {
	return PhysicalTime(m)
}

func (t PhysicalTime) Seconds() float64 {
	return float64(t) * secondsPerMonth
}
func (t PhysicalTime) Months() float64 {
	return float64(t)
}

func (t PhysicalTime) ToRealTime() time.Duration {
	// 1 real week is 1 in-game year
	return 7 * 24 * time.Hour * time.Duration(t.Months()/12)
}

type Age float64

func BillionYears(byrs float64) Age {
	return Age(byrs)
}

func (a Age) BillionYears() float64 {
	return float64(a)
}
