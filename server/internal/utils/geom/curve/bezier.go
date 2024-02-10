package curve

type bezierCurve struct {
	startX, startY float64
	endX, endY     float64
	c1X, c1Y       float64
	c2X, c2Y       float64
}

func (c *bezierCurve) Domain() (float64, float64) {
	return c.startX, c.endX
}

func (c *bezierCurve) Sample(x float64) float64 {
	// TODO
	return x
}
