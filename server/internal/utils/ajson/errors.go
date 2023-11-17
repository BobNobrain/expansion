package ajson

import (
	"fmt"
	"srv/internal/utils/common"
	"strings"
)

type IncorrectTypeError struct {
	expected string
	actual   string
}

func (e *IncorrectTypeError) Error() string {
	return fmt.Sprintf("incorrect type in arbitrary json: expected %s, found %s", e.expected, e.actual)
}

func (e *IncorrectTypeError) Code() string {
	return "ERR_JSON"
}

func (e *IncorrectTypeError) Details() common.Encodable {
	return nil
}

type PathDoesNotExistError struct {
	path         ArbitraryJSONPath
	maxValidPath ArbitraryJSONPath
}

func (e *PathDoesNotExistError) Error() string {
	path := strings.Join(e.path, ".")
	return fmt.Sprintf("no path '%s' found", path)
}

func (e *PathDoesNotExistError) Code() string {
	return "ERR_JSON"
}

func (e *PathDoesNotExistError) Details() common.Encodable {
	return nil
}

func newIncorrectType(expected string, actual interface{}) common.Error {
	return &IncorrectTypeError{
		expected: expected,
		actual:   getActualTypeName(actual),
	}
}

func newPathDoesNotExist(path ArbitraryJSONPath, stopIndex int) common.Error {
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
