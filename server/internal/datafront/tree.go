package datafront

import (
	"srv/internal/utils/common"
	"sync"
)

type treeImpl struct {
	lock *sync.RWMutex

	nodes  map[DFPathFragment]*treeImpl
	values map[DFPathFragment]ReactiveData
}

func newTreeImpl() *treeImpl {
	return &treeImpl{
		lock:   new(sync.RWMutex),
		nodes:  make(map[DFPathFragment]*treeImpl),
		values: make(map[DFPathFragment]ReactiveData),
	}
}

func (t *treeImpl) getData(path DFPath) (ReactiveData, common.Error) {
	subtreePath, dataName := path.Pop()
	subtree, notFoundIdx := t.subtree(subtreePath)
	if subtree == nil {
		return nil, newPathNotFoundError(path, notFoundIdx)
	}

	result, found := subtree.values[dataName]
	if !found {
		return nil, newPathNotFoundError(path, len(path)-1)
	}
	return result, nil
}

func (t *treeImpl) getSubtree(path DFPath) (*treeImpl, common.Error) {
	t.lock.RLock()
	defer t.lock.RUnlock()

	result, notFoundIdx := t.subtree(path)
	if result == nil {
		return nil, newPathNotFoundError(path, notFoundIdx)
	}
	return result, nil
}

func (t *treeImpl) attachValue(name DFPathFragment, value ReactiveData) {
	t.lock.Lock()
	defer t.lock.Unlock()

	t.values[name] = value
}

func (t *treeImpl) createSubtree(name DFPathFragment) *treeImpl {
	t.lock.Lock()
	defer t.lock.Unlock()

	child := newTreeImpl()
	t.nodes[name] = t
	return child
}

func (t *treeImpl) Dispose() {
	t.lock.Lock()
	defer t.lock.Unlock()

	for _, value := range t.values {
		value.Dispose()
	}

	for _, subtree := range t.nodes {
		subtree.Dispose()
	}
}

func (t *treeImpl) removeSubtree(name DFPathFragment) {
	t.lock.Lock()
	defer t.lock.Unlock()

	subtree, found := t.nodes[name]
	if !found {
		return
	}

	delete(t.nodes, name)
	subtree.Dispose()
}

func (t *treeImpl) detachValue(name DFPathFragment) {
	t.lock.Lock()
	defer t.lock.Unlock()

	value, found := t.values[name]
	if !found {
		return
	}

	delete(t.values, name)
	value.Dispose()
}

func (t *treeImpl) subtree(path DFPath) (*treeImpl, int) {
	result := t
	for i, fragment := range path {
		result.lock.RLock()
		child, found := result.nodes[fragment]
		result.lock.RUnlock()

		if !found {
			return nil, i
		}
		result = child
	}
	return result, -1
}

func (t *treeImpl) mkdirp(path DFPath) *treeImpl {
	result := t
	for _, fragment := range path {
		child, found := result.nodes[fragment]
		if !found {
			child = result.createSubtree(fragment)
		}
		result = child
	}
	return result
}
