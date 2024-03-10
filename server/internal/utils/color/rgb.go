package color

import (
	"fmt"
)

type RGBColor struct {
	r byte
	g byte
	b byte
}

func RGB(r, g, b int) *RGBColor {
	return &RGBColor{
		r: byte(r),
		g: byte(g),
		b: byte(b),
	}
}

func (c *RGBColor) ToRGBHex() string {
	return fmt.Sprintf("#%X%X%X", c.r, c.g, c.b)
}

func (c *RGBColor) ToCSSString() string {
	return fmt.Sprintf("rgb(%d,%d,%d)", c.r, c.g, c.b)
}
