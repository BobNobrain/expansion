package color

type Color interface {
	ToRGBHex() string
	ToCSSString() string

	GetR() byte
	GetG() byte
	GetB() byte
}
