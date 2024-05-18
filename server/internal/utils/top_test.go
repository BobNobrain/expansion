package utils_test

import (
	"srv/internal/utils"
	"testing"
)

type testData struct {
	limit    int
	inputs   []int
	expected []int
}

func TestTop(t *testing.T) {
	tests := []testData{
		{
			inputs:   []int{10, 4, 5, 3, -1, 0, 0, 8},
			expected: []int{10, 8, 5, 4, 3},
		},
		{
			inputs:   []int{0, 0, 10, 2, 3, 10, 0, -2, 8},
			expected: []int{10, 10, 8},
		},
		{
			inputs:   []int{0, -1, 0},
			expected: []int{0, 0, -1},
			limit:    5,
		},
		{
			inputs:   []int{0, 1, 2, 3, 4, 5, 6},
			expected: []int{6, 5, 4},
		},
	}

	for i, data := range tests {
		limit := data.limit
		if limit == 0 {
			limit = len(data.expected)
		}

		top := utils.MakeTop[int](limit)

		for _, item := range data.inputs {
			top.Insert(item, float64(item))
		}

		outputs := top.Get()
		if len(outputs) != len(data.expected) {
			t.Errorf("test #%d: expected %#v, got %#v", i, data.expected, outputs)
		}
		for j, actual := range outputs {
			expected := data.expected[j]
			if expected != actual {
				t.Errorf("test #%d: expected %#v, got %#v", i, data.expected, outputs)
			}
		}
	}
}
