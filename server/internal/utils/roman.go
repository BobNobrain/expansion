package utils

func ToRomanNumeral(n int) string {
	if n == 0 {
		return "0"
	}
	if n < 0 {
		return "-" + ToRomanNumeral(-n)
	}

	result := ""

	for n >= 1000 {
		result += "M"
		n -= 1000
	}
	if n >= 900 {
		result += "CM"
		n -= 900
	}

	for n >= 100 {
		result += "C"
		n -= 100
	}
	if n >= 90 {
		result += "XC"
		n -= 90
	}

	for n >= 50 {
		result += "L"
		n -= 50
	}
	if n >= 40 {
		result += "XL"
		n -= 40
	}

	for n >= 10 {
		result += "X"
		n -= 10
	}
	if n >= 9 {
		result += "IX"
		n -= 9
	}

	for n >= 5 {
		result += "V"
		n -= 5
	}
	if n >= 4 {
		result += "IV"
		n -= 4
	}

	for n >= 1 {
		result += "I"
		n -= 1
	}

	return result
}
