package color

type Color interface {
	ToRGBHex() string
	ToCSSString() string
}
