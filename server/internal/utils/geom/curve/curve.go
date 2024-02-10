package curve

type Curve interface {
	Domain() (float64, float64)
	Sample(x float64) float64
}
