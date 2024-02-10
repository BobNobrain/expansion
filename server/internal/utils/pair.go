package utils

type Pair[T any, U any] interface {
	First() T
	Second() U
}

type pairImpl[T any, U any] struct {
	fst T
	snd U
}

func (pair pairImpl[T, U]) First() T {
	return pair.fst
}

func (pair pairImpl[T, U]) Second() U {
	return pair.snd
}

func MakePair[T any, U any](fst T, snd U) Pair[T, U] {
	return pairImpl[T, U]{
		fst: fst,
		snd: snd,
	}
}
