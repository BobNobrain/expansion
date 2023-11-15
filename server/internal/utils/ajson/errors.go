package ajson

import (
	"fmt"
	"strings"
)

type IncorrectTypeError struct {
	expected string
	actual   string
}

func (e *IncorrectTypeError) Error() string {
	return fmt.Sprintf("incorrect type in arbitrary json: expected %s, found %s", e.expected, e.actual)
}

type PathDoesNotExistError struct {
	path         ArbitraryJSONPath
	maxValidPath ArbitraryJSONPath
}

func (e *PathDoesNotExistError) Error() string {
	path := strings.Join(e.path, ".")
	return fmt.Sprintf("no path '%s' found", path)
}

func newIncorrectType(expected string, actual interface{}) error {
	return &IncorrectTypeError{
		expected: expected,
		actual:   getActualTypeName(actual),
	}
}

func newPathDoesNotExist(path ArbitraryJSONPath, stopIndex int) error {
	return &PathDoesNotExistError{
		path:         path,
		maxValidPath: path[:stopIndex],
	}
}

func getActualTypeName(x interface{}) string {
	switch x.(type) {
	case bool:
		return "bool"

	case float64:
		return "float"

	case string:
		return "string"

	case []interface{}:
		return "array"

	case map[string]interface{}:
		return "object"

	case nil:
		return "null"
	}

	return "???"
}

func getExpectedTypeName[T any]() string {
	var nothing T
	return getActualTypeName(nothing)
}
