package predictable

import (
	"time"
)

type LimitedPredictableMode string

const (
	LimitModeAfter  LimitedPredictableMode = "after"
	LimitModeBefore LimitedPredictableMode = "before"
)

type LimitedPredictable interface {
	Predictable
	SetLimit(time.Time, LimitedPredictableMode) LimitedPredictable
}

type limitedPredictableImpl struct {
	Inner        Predictable
	TLim         time.Time
	IsBeforeMode bool
}

type limitedPredictableSerialized struct {
	Inner EncodedPredictable     `json:"inner"`
	TLim  time.Time              `json:"t"`
	Mode  LimitedPredictableMode `json:"mode"`
}

func (s limitedPredictableSerialized) toImpl() *limitedPredictableImpl {
	return &limitedPredictableImpl{
		Inner:        s.Inner.ToPredictable(),
		TLim:         s.TLim,
		IsBeforeMode: s.Mode == LimitModeBefore,
	}
}

func (l *limitedPredictableImpl) Sample(at time.Time) float64 {
	// BeforeMode means the value is at the limit *before* `TLim`
	if l.IsBeforeMode == at.Before(l.TLim) {
		return l.Inner.Sample(l.TLim)
	}
	return l.Inner.Sample(at)
}
func (l *limitedPredictableImpl) Wrap() EncodedPredictable {
	mode := LimitModeAfter
	if l.IsBeforeMode {
		mode = LimitModeBefore
	}

	return EncodedPredictable{
		Limited: &limitedPredictableSerialized{
			Inner: l.Inner.Wrap(),
			TLim:  l.TLim,
			Mode:  mode,
		},
	}
}
func (l *limitedPredictableImpl) Add(x float64) {
	l.Inner.Add(x)
}
func (l *limitedPredictableImpl) Clone() Predictable {
	return &limitedPredictableImpl{
		Inner:        l.Inner.Clone(),
		TLim:         l.TLim,
		IsBeforeMode: l.IsBeforeMode,
	}
}

func (l *limitedPredictableImpl) SetLimit(at time.Time, mode LimitedPredictableMode) LimitedPredictable {
	panic("unimplemented")
}

func NewLimited(inner Predictable, limit time.Time, mode LimitedPredictableMode) LimitedPredictable {
	return &limitedPredictableImpl{
		Inner:        inner,
		TLim:         limit,
		IsBeforeMode: mode == LimitModeBefore,
	}
}
