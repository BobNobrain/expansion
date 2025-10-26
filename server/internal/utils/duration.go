package utils

import (
	"fmt"
	"strconv"
	"time"
	"unicode"
)

func ParseDurationString(input string) (time.Duration, error) {
	var result time.Duration
	lastSegmentStart := -1

	for i, ch := range input {
		if unicode.IsDigit(ch) {
			if lastSegmentStart == -1 {
				lastSegmentStart = i
			}
			continue
		}

		if unicode.IsSpace(ch) {
			continue
		}

		if ch == 'h' || ch == 'm' || ch == 's' || ch == 'd' {
			if lastSegmentStart == -1 {
				return result, fmt.Errorf("invalid duration string: '%s'", input)
			}

			parsed, err := strconv.ParseInt(input[lastSegmentStart:i], 10, 64)
			if err != nil {
				return result, err
			}

			var mult time.Duration
			switch ch {
			case 'h':
				mult = time.Hour
			case 'm':
				mult = time.Minute
			case 's':
				mult = time.Second
			case 'd':
				mult = time.Hour * 24
			}

			result += mult * time.Duration(parsed)

			lastSegmentStart = -1
			continue
		}

		return result, fmt.Errorf("invalid duration string: '%s' (bad char '%c')", input, ch)
	}

	if lastSegmentStart != -1 {
		return result, fmt.Errorf("invalid duration string: '%s'", input)
	}

	return result, nil
}
