package utils

type Set[T comparable] struct {
	items map[T]bool
}

func NewSet[T comparable]() *Set[T] {
	return &Set[T]{
		items: make(map[T]bool),
	}
}

func (set *Set[T]) Add(item T) *Set[T] {
	set.items[item] = true
	return set
}
func (set *Set[T]) AddMany(items []T) *Set[T] {
	for _, item := range items {
		set.items[item] = true
	}
	return set
}

func (set *Set[T]) Remove(item T) *Set[T] {
	delete(set.items, item)
	return set
}

func (set *Set[T]) Clear() *Set[T] {
	for k := range set.items {
		delete(set.items, k)
	}
	return set
}

func (set *Set[T]) Has(item T) bool {
	return set.items[item]
}

func (set *Set[T]) Size() int {
	return len(set.items)
}

func (set *Set[T]) Items() map[T]bool {
	return set.items
}

func (set *Set[T]) ToSlice() []T {
	slice := make([]T, 0, len(set.items))
	for item := range set.items {
		slice = append(slice, item)
	}
	return slice
}
