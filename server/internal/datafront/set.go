package datafront

import "srv/internal/utils/common"

type ReactiveSet[T comparable] interface {
	ReactiveData

	GetTypedValue() map[T]bool
	AddItem(T)
	RemoveItem(T)
	Clear()
}

type reactiveSetImpl[T comparable] struct {
	reactiveBase
	values map[T]bool
}

func NewReactiveSet[T comparable]() ReactiveSet[T] {
	return &reactiveSetImpl[T]{
		reactiveBase: makeReactiveBase(),
		values:       make(map[T]bool),
	}
}

func (r *reactiveSetImpl[T]) GetValue() common.Encodable {
	r.lock.Lock()
	defer r.lock.Unlock()

	return common.AsEncodable(r.values)
}

func (r *reactiveSetImpl[T]) GetTypedValue() map[T]bool {
	r.lock.Lock()
	defer r.lock.Unlock()

	return r.values
}

func (r *reactiveSetImpl[T]) AddItem(item T) {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.values[item] = true
	r.trigger(DFUpdatePatch{
		ItemAdd: &DFUpdatePatchItemAdd{
			NewValue: item,
		},
	})
}

func (r *reactiveSetImpl[T]) RemoveItem(item T) {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.values, item)
	r.trigger(DFUpdatePatch{
		SetItemDelete: &DFUpdatePatchSetItemDelete{
			DeletedValue: item,
		},
	})
}

func (r *reactiveSetImpl[T]) Clear() {
	r.lock.Lock()
	defer r.lock.Unlock()

	for k := range r.values {
		delete(r.values, k)
	}
	r.trigger(DFUpdatePatch{
		Clear: &DFUpdatePatchClear{},
	})
}

func (r *reactiveSetImpl[T]) Dispose() {}
