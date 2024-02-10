package curve

type linearCurve struct {
	startX, startY float64
	endX, endY     float64
}

func (c *linearCurve) Domain() (float64, float64) {
	return c.startX, c.endX
}

func (c *linearCurve) Sample(x float64) float64 {
	dy := c.endY - c.startY
	dx := c.endX - c.startX
	return c.startY + dy*(x-c.startX)/dx
}
