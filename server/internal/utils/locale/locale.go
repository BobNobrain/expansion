package locale

import (
	"slices"
	"strings"
)

type Locale string

const (
	EnUSLocale Locale = "en-US"
	RuRULocale Locale = "ru-RU"

	DefaultLocale = EnUSLocale
)

var allLocales = []Locale{
	EnUSLocale,
	RuRULocale,
}

func GetAllSupportedLocales() []Locale {
	return allLocales
}

func Parse(locStr string) Locale {
	switch locStr {
	case string(EnUSLocale):
	case "en":
		return EnUSLocale

	case string(RuRULocale):
	case "ru":
		return RuRULocale
	}

	return DefaultLocale
}

func ParseWeightedLocalesList(str string) []Locale {
	trimmed := strings.Trim(str, " \r\n\t")
	result := make([]Locale, 0)

	if trimmed == "*" {
		return result
	}

	// TODO: maybe some time I shall sort them by weight, but whatever

	fragments := strings.Split(trimmed, ",")
	for _, fragment := range fragments {
		value, _, _ := strings.Cut(fragment, ";")

		if slices.Index(allLocales, Locale(value)) < 0 {
			// we will just discard all unknown locale values for now
			continue
		}

		result = append(result, Locale(value))
	}

	return result
}
