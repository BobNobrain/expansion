package predictable

import (
	"time"
)

type LinearPredictable interface {
	Predictable
	GetInitial() (float64, time.Time)
	GetSpeed() (float64, time.Duration)

	SetSpeed(deltaX float64, deltaT time.Duration) LinearPredictable
	SetInitial(x0 float64, t0 time.Time) LinearPredictable

	AddLinear(LinearPredictable)
}

type linearPredictableImpl struct {
	// The value that was observed at `T0` time (ref. point value)
	X0 float64 `json:"x"`
	// Linear speed of value change (per hours)
	Speed float64 `json:"speed"`
	// Time when this value was at `X0` (ref. point time)
	T0 time.Time `json:"t"`
}

func (l *linearPredictableImpl) Sample(at time.Time) float64 {
	deltaTHours := at.Sub(l.T0).Hours()
	return l.X0 + l.Speed*deltaTHours
}
func (l *linearPredictableImpl) Wrap() EncodedPredictable {
	return EncodedPredictable{Linear: l}
}
func (l *linearPredictableImpl) Add(x float64) {
	l.X0 += x
}
func (l *linearPredictableImpl) Clone() Predictable {
	return &linearPredictableImpl{
		X0:    l.X0,
		T0:    l.T0,
		Speed: l.Speed,
	}
}

func (l *linearPredictableImpl) GetInitial() (float64, time.Time) {
	return l.X0, l.T0
}
func (l *linearPredictableImpl) GetSpeed() (float64, time.Duration) {
	return l.Speed, time.Hour
}

func (l *linearPredictableImpl) SetInitial(x0 float64, t0 time.Time) LinearPredictable {
	l.X0 = x0
	l.T0 = t0
	return l
}

func (l *linearPredictableImpl) SetSpeed(deltaX float64, deltaT time.Duration) LinearPredictable {
	l.Speed = deltaX / deltaT.Hours()
	return l
}

func (l1 *linearPredictableImpl) AddLinear(l2 LinearPredictable) {
	// TODO
}

func NewLinear(x0 float64, t0 time.Time, deltaX float64, deltaT time.Duration) LinearPredictable {
	return &linearPredictableImpl{
		X0:    x0,
		T0:    t0,
		Speed: deltaX / deltaT.Hours(),
	}
}
