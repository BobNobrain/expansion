package scale

type ScaleItem[T ~byte] struct {
	ScaleValue  T
	CoeffToPrev float64
}

type ScaledScalar[T ~byte] struct {
	scaleValue T
	value      float64
}

type Scale struct {
	coeffs map[byte]float64
}

func MakeScale[T ~byte](items []ScaleItem[T]) *Scale {
	n := len(items)
	if n > 15 {
		panic("cannot make scale so big")
	}
	if n < 2 {
		panic("scale must have at least 2 items")
	}

	result := &Scale{
		coeffs: make(map[byte]float64),
	}

	for i := 0; i < n; i++ {
		from := items[i]
		coeff := 1.0
		for j := i + 1; j < n; j++ {
			to := items[j]
			coeff /= to.CoeffToPrev
			result.setCoeff(byte(from.ScaleValue), byte(to.ScaleValue), coeff)
			result.setCoeff(byte(to.ScaleValue), byte(from.ScaleValue), 1/coeff)
		}
	}

	return result
}

func MakeScalar[T ~byte](scaleValue T, value float64) ScaledScalar[T] {
	return ScaledScalar[T]{scaleValue: scaleValue, value: value}
}

func (s ScaledScalar[T]) ToScale(scaleValue T, scale *Scale) float64 {
	if s.scaleValue == scaleValue {
		return s.value
	}
	coeff := scale.getCoeff(byte(s.scaleValue), byte(scaleValue))
	return s.value * coeff
}

func makeCoeffsKey(from, to byte) byte {
	key := (from << 4) | to
	return key
}

func (s *Scale) getCoeff(from, to byte) float64 {
	key := makeCoeffsKey(from, to)
	return s.coeffs[key]
}
func (s *Scale) setCoeff(from, to byte, coeff float64) {
	key := makeCoeffsKey(from, to)
	s.coeffs[key] = coeff
}
