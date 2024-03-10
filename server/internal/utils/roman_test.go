package utils_test

import (
	"srv/internal/utils"
	"testing"
)

func TestRomanNumerals(t *testing.T) {
	samples := map[int]string{
		-9: "-IX",
		-1: "-I",

		0: "0",
		1: "I",
		2: "II",
		3: "III",
		4: "IV",
		5: "V",
		6: "VI",
		7: "VII",
		8: "VIII",
		9: "IX",

		10: "X",
		11: "XI",
		12: "XII",
		13: "XIII",
		14: "XIV",
		15: "XV",
		18: "XVIII",
		19: "XIX",
		20: "XX",

		39: "XXXIX",
		40: "XL",
		41: "XLI",

		49: "XLIX",
		50: "L",
		51: "LI",

		89: "LXXXIX",
		90: "XC",
		91: "XCI",

		99:  "XCIX",
		100: "C",
		101: "CI",

		990:  "CMXC",
		999:  "CMXCIX",
		1000: "M",
		1001: "MI",

		1337: "MCCCXXXVII",
		2000: "MM",
	}

	for n, s := range samples {
		roman := utils.ToRomanNumeral(n)
		if roman != s {
			t.Errorf("wrong roman numeral for %d: expected '%s', got '%s'", n, s, roman)
		}
	}
}
