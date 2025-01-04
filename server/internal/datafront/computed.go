package datafront

import "srv/internal/utils/common"

type reactiveComputedImpl struct {
	reactiveBase

	getter  func() common.Encodable
	deps    []ReactiveData
	isDirty bool
	value   common.Encodable
}

func NewReactiveComputed(getter func() common.Encodable, deps []ReactiveData) ReactiveData {
	result := &reactiveComputedImpl{
		reactiveBase: makeReactiveBase(),
		getter:       getter,
		deps:         nil,
		isDirty:      true,
		value:        nil,
	}

	for _, d := range deps {
		d.Listen(result)
	}

	return result
}

func (r *reactiveComputedImpl) GetValue() common.Encodable {
	r.lock.Lock()
	defer r.lock.Unlock()

	if r.isDirty {
		r.value = r.getter()
		r.isDirty = false
	}
	return r.value
}

func (r *reactiveComputedImpl) Dispose() {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, d := range r.deps {
		d.Unlisten(r)
	}
}

func (r *reactiveComputedImpl) NotifyUpdated() {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.isDirty = true

	// only trigger recalculation if somebody has subscribed
	// maybe we just should do it eagerly
	if len(r.subs) > 0 {
		r.trigger(DFUpdatePatch{
			Replace: &DFUpdatePatchReplace{
				NewValue: r.GetValue(),
			},
		})
	}
}
