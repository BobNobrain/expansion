package utils

// Top[T] allows to run through an array of objects and find top-N
// of them by some arbitrary metric.
// It is just like SELECT * FROM objects ORDER BY arbitrary_value DESC LIMIT N;
// First, you make a Top object with MakeTop(N), and then loop through your
// objects and call .Insert(nextObject, arbitraryValue).
// When you are done, just call .Get() to retrieve the result.
type Top[T any] struct {
	limit  int
	items  []T
	values []float64
}

func MakeTop[T any](limit int) *Top[T] {
	return &Top[T]{
		limit:  limit,
		items:  make([]T, 0, limit),
		values: make([]float64, 0, limit),
	}
}

func (t *Top[T]) Get() []T {
	return t.items
}

func (t *Top[T]) Insert(item T, value float64) {
	index := t.findInsertIndex(value)
	if index >= t.limit {
		return
	}

	if len(t.items) < t.limit {
		t.items = append(t.items, item)
		t.values = append(t.values, value)
	}

	for i := len(t.items) - 1; i > index; i-- {
		t.items[i] = t.items[i-1]
		t.values[i] = t.values[i-1]
	}

	t.items[index] = item
	t.values[index] = value
}

func (t *Top[T]) findInsertIndex(value float64) int {
	if len(t.items) == 0 {
		return 0
	}

	// just a binary search
	start := 0
	end := len(t.items) - 1

	for end-start > 1 {
		middle := start + (end-start)/2
		mval := t.values[middle]
		if value > mval {
			end = middle
		} else {
			start = middle
		}
	}

	if value > t.values[start] {
		return start
	}
	if value > t.values[end] {
		return end
	}
	return end + 1
}
