package scale

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"math"
)

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

func (s1 ScaledScalar[T]) Add(s2 ScaledScalar[T], scale *Scale) ScaledScalar[T] {
	maxScale := s1.scaleValue
	if s2.scaleValue > s1.scaleValue {
		maxScale = s2.scaleValue
	}
	value := s1.ToScale(maxScale, scale) + s2.ToScale(maxScale, scale)
	return ScaledScalar[T]{scaleValue: maxScale, value: value}
}
func (s1 ScaledScalar[T]) Diff(s2 ScaledScalar[T], scale *Scale) ScaledScalar[T] {
	maxScale := s1.scaleValue
	if s2.scaleValue > s1.scaleValue {
		maxScale = s2.scaleValue
	}
	value := s1.ToScale(maxScale, scale) - s2.ToScale(maxScale, scale)
	return ScaledScalar[T]{scaleValue: maxScale, value: value}
}
func (s ScaledScalar[T]) Multiply(factor float64) ScaledScalar[T] {
	return ScaledScalar[T]{scaleValue: s.scaleValue, value: s.value * factor}
}
func (s1 ScaledScalar[T]) Max(s2 ScaledScalar[T], scale *Scale) ScaledScalar[T] {
	maxScale := s1.scaleValue
	if s2.scaleValue > s1.scaleValue {
		maxScale = s2.scaleValue
	}
	value1 := s1.ToScale(maxScale, scale)
	value2 := s2.ToScale(maxScale, scale)
	if value1 < value2 {
		return s2
	}
	return s1
}
func (s1 ScaledScalar[T]) IsCloseTo(s2 ScaledScalar[T], scale *Scale, eps float64) bool {
	maxScale := s1.scaleValue
	if s2.scaleValue > s1.scaleValue {
		maxScale = s2.scaleValue
	}
	v1 := s1.ToScale(maxScale, scale)
	v2 := s2.ToScale(maxScale, scale)
	return math.Abs(v1-v2) < eps
}

func (s1 ScaledScalar[T]) IsGreaterThan(s2 ScaledScalar[T], scale *Scale) bool {
	maxScale := s1.scaleValue
	if s2.scaleValue > s1.scaleValue {
		maxScale = s2.scaleValue
	}
	v1 := s1.ToScale(maxScale, scale)
	v2 := s2.ToScale(maxScale, scale)
	return v1 > v2
}

func (s1 ScaledScalar[T]) IsLessThan(s2 ScaledScalar[T], scale *Scale) bool {
	maxScale := s1.scaleValue
	if s2.scaleValue > s1.scaleValue {
		maxScale = s2.scaleValue
	}
	v1 := s1.ToScale(maxScale, scale)
	v2 := s2.ToScale(maxScale, scale)
	return v1 < v2
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

func (s ScaledScalar[T]) MarshalBinary() ([]byte, error) {
	b := new(bytes.Buffer)
	b.WriteByte(byte(s.scaleValue))
	err := binary.Write(b, binary.LittleEndian, s.value)
	if err != nil {
		return nil, err
	}
	return b.Bytes(), nil
}

func (s *ScaledScalar[T]) UnmarshalBinary(data []byte) error {
	r := bytes.NewReader(data)
	err := binary.Read(r, binary.LittleEndian, &s.scaleValue)
	if err != nil {
		return err
	}
	err = binary.Read(r, binary.LittleEndian, &s.value)
	return err
}

type scaledScalarJSON struct {
	S int
	V float64
}

func (s ScaledScalar[T]) MarshalJSON() ([]byte, error) {
	return json.Marshal(scaledScalarJSON{
		S: int(s.scaleValue),
		V: s.value,
	})
}

func (s *ScaledScalar[T]) UnmarshalJSON(data []byte) error {
	var parsed scaledScalarJSON
	err := json.Unmarshal(data, &parsed)
	if err != nil {
		return err
	}

	s.scaleValue = T(parsed.S)
	s.value = parsed.V
	return nil
}
