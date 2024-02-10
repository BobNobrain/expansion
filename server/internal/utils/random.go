package utils

import "math/rand"

func DrawDistinctIntegers(rnd *rand.Rand, count int, max int) map[int]bool {
	met := make(map[int]bool)

	for i := 0; i < count; i++ {
		next := rnd.Intn(max - count + i)
		if found := met[next]; found {
			met[max-count+i] = true
		} else {
			met[next] = true
		}
	}

	return met
}
