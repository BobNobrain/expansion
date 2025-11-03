package utils

type Maybe[T any] struct {
	value T
}

func (m *Maybe[T]) HasValue() bool {
	return m != nil
}
func (m *Maybe[T]) Value() T {
	if m == nil {
		panic("trying to unwrap an empty Maybe value")
	}
	return m.value
}

func Just[T any](value T) *Maybe[T] {
	return &Maybe[T]{value: value}
}
func Nothing[T any]() *Maybe[T] {
	return nil
}
