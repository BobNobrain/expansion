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

// Stringifies duration into a clientside-supported string like 10h, 2h30m, etc.
// Currently does not support negative durations (they will be outputted like positive).
func StringifyDuration(d time.Duration) string {
	seconds := int(d.Abs().Seconds())

	if seconds == 0 {
		return "0s"
	}

	minutes := seconds / 60
	seconds -= minutes * 60

	hours := minutes / 60
	minutes -= hours * 60

	days := hours / 24
	hours -= days * 24

	var result string

	if days > 0 {
		result += fmt.Sprintf("%dd", days)
	}
	if hours > 0 {
		result += fmt.Sprintf("%dh", hours)
	}
	if minutes > 0 {
		result += fmt.Sprintf("%dm", minutes)
	}
	if seconds > 0 {
		result += fmt.Sprintf("%ds", seconds)
	}

	return result
}
