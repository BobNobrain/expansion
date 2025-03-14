package utils

type Set[T comparable] interface {
	Add(T) Set[T]
	AddMany([]T) Set[T]
	Remove(T) Set[T]
	Clear() Set[T]
	Has(T) bool
	Size() int
}

type UndeterministicSet[T comparable] struct {
	items map[T]bool
}

func NewUndeterministicSet[T comparable]() *UndeterministicSet[T] {
	return &UndeterministicSet[T]{
		items: make(map[T]bool),
	}
}

func (set *UndeterministicSet[T]) Add(item T) *UndeterministicSet[T] {
	set.items[item] = true
	return set
}
func (set *UndeterministicSet[T]) AddMany(items []T) *UndeterministicSet[T] {
	for _, item := range items {
		set.items[item] = true
	}
	return set
}

func (set *UndeterministicSet[T]) Remove(item T) *UndeterministicSet[T] {
	delete(set.items, item)
	return set
}

func (set *UndeterministicSet[T]) Clear() *UndeterministicSet[T] {
	for k := range set.items {
		delete(set.items, k)
	}
	return set
}

func (set *UndeterministicSet[T]) Has(item T) bool {
	return set.items[item]
}

func (set *UndeterministicSet[T]) Size() int {
	return len(set.items)
}

func (set *UndeterministicSet[T]) Items() map[T]bool {
	return set.items
}

func (set *UndeterministicSet[T]) ToSlice() []T {
	slice := make([]T, 0, len(set.items))
	for item := range set.items {
		slice = append(slice, item)
	}
	return slice
}

type DeterministicSet[T comparable] struct {
	hash map[T]bool
	list []T
}

func NewDeterministicSet[T comparable]() *DeterministicSet[T] {
	return &DeterministicSet[T]{hash: make(map[T]bool), list: nil}
}

func (set *DeterministicSet[T]) Add(item T) *DeterministicSet[T] {
	if set.hash[item] {
		return set
	}

	set.hash[item] = true
	set.list = append(set.list, item)
	return set
}
func (set *DeterministicSet[T]) AddMany(items []T) *DeterministicSet[T] {
	for _, item := range items {
		set.Add(item)
	}
	return set
}

func (set *DeterministicSet[T]) Remove(item T) *DeterministicSet[T] {
	if !set.hash[item] {
		return set
	}

	delete(set.hash, item)
	set.list = FastRemove(set.list, item)
	return set
}

func (set *DeterministicSet[T]) Clear() *DeterministicSet[T] {
	clear(set.hash)
	set.list = nil
	return set
}

func (set *DeterministicSet[T]) Has(item T) bool {
	return set.hash[item]
}

func (set *DeterministicSet[T]) Size() int {
	return len(set.hash)
}

func (set *DeterministicSet[T]) Items() []T {
	return set.list
}
