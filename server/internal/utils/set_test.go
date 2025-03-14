package utils_test

import (
	"math/rand"
	"srv/internal/utils"
	"testing"
)

func TestDeterministicSetIsDeterministic(t *testing.T) {
	ds := utils.NewDeterministicSet[int]()
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 0}

	for range 20 {
		rnd := rand.Float64()
		n := nums[rand.Intn(len(nums))]
		if rnd < 0.33 {
			ds.Remove(n)
		} else {
			ds.Add(n)
		}
	}

	orderMet := make([]int, 0, ds.Size())
	for _, item := range ds.Items() {
		orderMet = append(orderMet, item)
	}

	for range 10 {
		for i, item := range ds.Items() {
			if item != orderMet[i] {
				t.Fatalf("order is inconsistent! expected %v, got %d at %d", orderMet, item, i)
			}
		}
	}
}

func checkItemsAreEqual(t *testing.T, actual *utils.DeterministicSet[int], expected []int) {
	if len(expected) != actual.Size() {
		t.Fatalf("size mismatch: expected %d, got %d (%v vs. %v)", len(expected), actual.Size(), expected, actual.Items())
	}

	for i, item := range actual.Items() {
		if expected[i] != item {
			t.Fatalf("items check failed: expected %v, got %d at %d", expected, item, i)
		}
	}
}

func TestDeterministicSetBasicOperations(t *testing.T) {
	ds := utils.NewDeterministicSet[int]()

	ds.Add(1)
	ds.Add(2)
	ds.Add(1)

	if ds.Size() != 2 {
		t.Fatal("size check failed after .Add()")
	}
	checkItemsAreEqual(t, ds, []int{1, 2})

	ds.Add(3)
	ds.Remove(1)
	ds.Remove(4)

	if ds.Size() != 2 {
		t.Fatal("size check failed after .Remove()")
	}
	checkItemsAreEqual(t, ds, []int{3, 2})

	ds.Clear()
	ds.Add(2)
	ds.Add(5)
	ds.Remove(5)

	if ds.Size() != 1 {
		t.Fatal("size check failed after .Clear()")
	}
	checkItemsAreEqual(t, ds, []int{2})
}
