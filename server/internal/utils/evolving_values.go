package utils

import "time"

type LinearEV struct {
	// The value that was observed at `LastUpdated` time (ref. point value)
	InitialValue float64 `json:"x"`
	// Linear speed of value change (per hours)
	Speed float64 `json:"speed"`
	// Time when this value was at `InitialValue` (ref. point time)
	LastUpdated time.Time `json:"t"`
}

func (v LinearEV) Sample(at time.Time) float64 {
	elapsed := at.Sub(v.LastUpdated)
	return v.InitialValue + v.Speed*elapsed.Hours()
}

func (v *LinearEV) UpdateSpeed(amount float64, per time.Duration, now time.Time) {
	v.InitialValue = v.Sample(now)
	v.Speed = amount / per.Hours()
	v.LastUpdated = now
}
