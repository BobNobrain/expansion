package predictable

import (
	"time"
)

type ConstantPredictable interface {
	Predictable
	GetConstant() float64
	SetConstant(float64) ConstantPredictable
}

type constantPredictableImpl struct {
	Value float64 `json:"x"`
}

func (c *constantPredictableImpl) Wrap() EncodedPredictable {
	return EncodedPredictable{Constant: c}
}
func (c *constantPredictableImpl) Sample(time.Time) float64 {
	return c.Value
}
func (c *constantPredictableImpl) Add(x float64) {
	c.Value += x
}
func (c *constantPredictableImpl) Clone() Predictable {
	return &constantPredictableImpl{Value: c.Value}
}

func (c *constantPredictableImpl) GetConstant() float64 {
	return c.Value
}
func (c *constantPredictableImpl) SetConstant(v float64) ConstantPredictable {
	c.Value = v
	return c
}

func NewConstant(value float64) ConstantPredictable {
	return &constantPredictableImpl{Value: value}
}
