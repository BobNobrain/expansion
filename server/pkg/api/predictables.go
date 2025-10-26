package api

import "time"

type Predictable struct {
	Const   *ConstantPredictable `json:"c,omitempty"`
	Linear  *LinearPredictable   `json:"l,omitempty"`
	Limited *LimitedPredictable  `json:"b,omitempty"`
}

type ConstantPredictable struct {
	X float64 `json:"x"`
}

type LinearPredictable struct {
	X float64   `json:"x"`
	T time.Time `json:"t"`
	V float64   `json:"v"`
}

type LimitedPredictable struct {
	Inner Predictable `json:"inner"`
	X     float64     `json:"x"`
	Mode  string      `json:"mode"`
}
