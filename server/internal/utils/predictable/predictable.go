package predictable

import (
	"time"
)

type Predictable interface {
	Wrap() EncodedPredictable
	Sample(time.Time) float64
	Clone() Predictable

	Add(x float64)
}
