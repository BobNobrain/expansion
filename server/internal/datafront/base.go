package datafront

import (
	"srv/internal/domain"
	"srv/internal/utils"
	"sync"
)

type reactiveBase struct {
	df   *DataFront
	path DFPath

	lock      *sync.Mutex
	listeners map[ReactiveDataListener]bool
	subs      []domain.ClientID
}

func makeReactiveBase() reactiveBase {
	result := reactiveBase{
		lock:      new(sync.Mutex),
		listeners: make(map[ReactiveDataListener]bool),
		subs:      make([]domain.ClientID, 0),
	}

	return result
}

func (r *reactiveBase) Listen(s ReactiveDataListener) {
	r.lock.Lock()
	defer r.lock.Unlock()

	if !r.listeners[s] {
		r.listeners[s] = true
	}
}

func (r *reactiveBase) Unlisten(s ReactiveDataListener) {
	r.lock.Lock()
	defer r.lock.Unlock()

	delete(r.listeners, s)
}

func (r *reactiveBase) Subscribe(target domain.ClientID) {
	r.lock.Lock()
	defer r.lock.Unlock()

	for _, cid := range r.subs {
		if cid == target {
			return
		}
	}

	r.subs = append(r.subs, target)
}
func (r *reactiveBase) Unsubscribe(target domain.ClientID) {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.subs = utils.FastRemove(r.subs, target)
}

func (r *reactiveBase) Attach(df *DataFront, path DFPath) {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.df = df
	r.path = path
}

func (r *reactiveBase) trigger(patch DFUpdatePatch) {
	patch.Path = r.path.StringArray()

	for s := range r.listeners {
		s.NotifyUpdated()
	}

	r.df.notifyUpdated(patch, r.subs)
}
