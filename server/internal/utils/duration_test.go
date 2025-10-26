package utils_test

import (
	"srv/internal/utils"
	"testing"
	"time"
)

type parseDurationStringTestCase struct {
	input  string
	output time.Duration
	err    bool
}

func TestParseDurationString(t *testing.T) {
	testCases := []parseDurationStringTestCase{
		{input: "1s", output: time.Second},
		{input: "2s", output: 2 * time.Second},
		{input: "10m", output: 10 * time.Minute},
		{input: "2h", output: 2 * time.Hour},
		{input: "3d", output: 72 * time.Hour},
		{input: "3h30m", output: 3*time.Hour + 30*time.Minute},
		{input: "1d2h30s", output: 26*time.Hour + 30*time.Second},
		{input: "1d 2h  30s", output: 26*time.Hour + 30*time.Second},
		{input: "", err: true},
		{input: "1t", err: true},
		{input: "d", err: true},
		{input: "656", err: true},
		{input: ".8s", err: true},
	}

	for _, tc := range testCases {
		actual, err := utils.ParseDurationString(tc.input)

		if err != nil {
			if tc.err {
				continue
			}

			t.Fatalf("unexpected error for input '%s': '%s'", tc.input, err.Error())
		}

		if actual != tc.output {
			t.Fatalf("mismatched parsed value for input '%s': expected '%d', actual '%d'", tc.input, tc.output, actual)
		}
	}
}
