package utils

import "math/rand"

const randomIDAlphabet string = "0123456789abcdefghijklmnopqrstuvwxyz"

func GenerateRandomStringID(length int) string {
	result := make([]byte, length)

	for i := 0; i < length; i++ {
		result[i] = randomIDAlphabet[rand.Intn(len(randomIDAlphabet))]
	}

	return string(result)
}
