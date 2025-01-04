package datafront

import "srv/internal/utils/common"

type ReactivePrimitive[T comparable] interface {
	ReactiveData

	GetTypedValue() T
	SetValue(T)
}

type reactivePrimitiveImpl[T comparable] struct {
	reactiveBase
	value T
}

func NewReactivePrimitive[T comparable](initialValue T) ReactivePrimitive[T] {
	return &reactivePrimitiveImpl[T]{
		reactiveBase: makeReactiveBase(),
		value:        initialValue,
	}
}

func (r *reactivePrimitiveImpl[T]) GetTypedValue() T {
	return r.value
}

func (r *reactivePrimitiveImpl[T]) GetValue() common.Encodable {
	return common.AsEncodable(r.value)
}

func (r *reactivePrimitiveImpl[T]) SetValue(newValue T) {
	if r.value == newValue {
		return
	}

	r.value = newValue
	r.reactiveBase.trigger(DFUpdatePatch{
		Replace: &DFUpdatePatchReplace{
			NewValue: newValue,
		},
	})
}

func (r *reactivePrimitiveImpl[T]) Dispose() {}
