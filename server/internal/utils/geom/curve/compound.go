package curve

type compoundCurve struct {
	minX, maxX float64
	segments   []Curve
}

func (c *compoundCurve) Domain() (float64, float64) {
	return c.minX, c.maxX
}

func (c *compoundCurve) Sample(x float64) float64 {
	for _, segment := range c.segments {
		min, max := segment.Domain()
		if min <= x && x < max {
			return segment.Sample(x)
		}
	}

	return 0
}
