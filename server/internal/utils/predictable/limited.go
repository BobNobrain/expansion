package predictable

import (
	"time"
)

type LimitedPredictableMode string

const (
	LimitModeMax LimitedPredictableMode = "max"
	LimitModeMin LimitedPredictableMode = "min"
)

type LimitedPredictable interface {
	Predictable
	SetLimit(time.Time, LimitedPredictableMode) LimitedPredictable
}

type limitedPredictableImpl struct {
	Inner     Predictable
	XLim      float64
	IsMaxMode bool
}

type limitedPredictableSerialized struct {
	Inner EncodedPredictable     `json:"inner"`
	XLim  float64                `json:"x"`
	Mode  LimitedPredictableMode `json:"mode"`
}

func (s limitedPredictableSerialized) toImpl() *limitedPredictableImpl {
	return &limitedPredictableImpl{
		Inner:     s.Inner.ToPredictable(),
		XLim:      s.XLim,
		IsMaxMode: s.Mode == LimitModeMax,
	}
}

func (l *limitedPredictableImpl) Sample(at time.Time) float64 {
	unlimited := l.Inner.Sample(at)

	if l.IsMaxMode {
		return max(l.XLim, unlimited)
	}
	return min(l.XLim, unlimited)
}
func (l *limitedPredictableImpl) Wrap() EncodedPredictable {
	mode := LimitModeMin
	if l.IsMaxMode {
		mode = LimitModeMax
	}

	return EncodedPredictable{
		Limited: &limitedPredictableSerialized{
			Inner: l.Inner.Wrap(),
			XLim:  l.XLim,
			Mode:  mode,
		},
	}
}
func (l *limitedPredictableImpl) Add(x float64) {
	l.Inner.Add(x)
}
func (l *limitedPredictableImpl) Clone() Predictable {
	return &limitedPredictableImpl{
		Inner:     l.Inner.Clone(),
		XLim:      l.XLim,
		IsMaxMode: l.IsMaxMode,
	}
}

func (l *limitedPredictableImpl) SetLimit(time.Time, LimitedPredictableMode) LimitedPredictable {
	panic("unimplemented")
}

func NewLimited(inner Predictable, limit float64, mode LimitedPredictableMode) LimitedPredictable {
	return &limitedPredictableImpl{
		Inner:     inner,
		XLim:      limit,
		IsMaxMode: mode == LimitModeMax,
	}
}
