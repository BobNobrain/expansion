package utils

import (
	"math/rand"
)

const randomIDAlphabet string = "0123456789abcdefghijklmnopqrstuvwxyz"

func GenerateRandomStringID(length int, rnd *rand.Rand) string {
	result := make([]byte, length)

	for i := 0; i < length; i++ {
		result[i] = randomIDAlphabet[rnd.Intn(len(randomIDAlphabet))]
	}

	return string(result)
}

func GenerateRandomStringIDFormatted(format string, rnd *rand.Rand) string {
	length := len(format)
	result := make([]byte, length)

	for i := 0; i < length; i++ {
		fchar := format[i]
		var char byte

		switch true {
		case 'a' <= fchar && fchar <= 'z':
			char = 'a' + byte(rnd.Intn('z'-'a'))

		case 'A' <= fchar && fchar <= 'Z':
			char = 'A' + byte(rnd.Intn('Z'-'A'))

		case '0' <= fchar && fchar <= '9':
			char = '0' + byte(rnd.Intn('9'-'0'))

		case fchar == '*':
			char = randomIDAlphabet[rnd.Intn(len(randomIDAlphabet))]

		default:
			char = fchar
		}

		result[i] = char
	}

	return string(result)
}
