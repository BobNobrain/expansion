package utils

import (
	"hash/fnv"
	"math"
	"math/rand"
)

func GetSeededRandom(seed string) *rand.Rand {
	hash := fnv.New64a()
	hash.Write([]byte(seed))
	usum := hash.Sum64()

	sum := int64(usum)
	if usum > math.MaxInt64 {
		sum = -int64(usum - math.MaxInt64)
	}

	source := rand.NewSource(sum)
	rnd := rand.New(source)

	return rnd
}

func DrawDistinctIntegers(rnd *rand.Rand, count int, max int) []int {
	met := NewDeterministicSet[int]()

	for i := 0; i < count; i++ {
		next := rnd.Intn(max - count + i)
		if met.Has(next) {
			met.Add(max - count + i)
		} else {
			met.Add(next)
		}
	}

	return met.Items()
}
