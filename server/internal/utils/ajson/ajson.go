package ajson

import (
	"srv/internal/utils/common"
	"strconv"
)

type ArbitraryJSONPath = []string

type JSONPrimitive interface {
	float64 | string | bool
}

type GetNullableOptions struct {
	Path     ArbitraryJSONPath
	Optional bool
}

func GetPrimitive[T JSONPrimitive](json interface{}, path ArbitraryJSONPath) (T, common.Error) {
	content, err := lookup(json, path, false)
	if err != nil {
		var nothing T
		return nothing, err
	}

	switch result := content.(type) {
	case T:
		return result, nil

	default:
		var nothing T
		return nothing, newIncorrectType(getActualTypeName(nothing), content)
	}
}

func GetNullablePrimitive[T JSONPrimitive](json interface{}, opts GetNullableOptions) (*T, common.Error) {
	content, err := lookup(json, opts.Path, opts.Optional)
	if err != nil {
		return nil, err
	}

	switch result := content.(type) {
	case T:
		return &result, nil

	case nil:
		return nil, nil

	default:
		var nothing T
		return nil, newIncorrectType(getActualTypeName(nothing)+" | null", content)
	}
}

func GetArrayOfPrimitives[T JSONPrimitive](json interface{}, opts GetNullableOptions) ([]T, common.Error) {
	content, err := lookup(json, opts.Path, opts.Optional)
	if err != nil {
		return nil, err
	}

	switch casted := content.(type) {
	case []interface{}:
		result := make([]T, 0, len(casted))

		for _, item := range casted {
			switch castedItem := item.(type) {
			case T:
				result = append(result, castedItem)

			default:
				return nil, newIncorrectType(getExpectedTypeName[T](), item)
			}
		}

		return result, nil

	case nil:
		if opts.Optional {
			return nil, nil
		}

		var nothing T
		return nil, newIncorrectType(getActualTypeName(nothing)+"[]", nil)

	default:
		var nothing T
		return nil, newIncorrectType(getActualTypeName(nothing)+" | null", content)
	}
}

func lookup(root interface{}, path ArbitraryJSONPath, optional bool) (interface{}, common.Error) {
	cursor := root
	for i, nextProp := range path {
		switch casted := cursor.(type) {
		case map[string]interface{}:
			inner, found := casted[nextProp]
			if !found && !optional {
				return nil, newPathDoesNotExist(path, i)
			}

			cursor = inner
			continue

		case []interface{}:
			asNum, err := strconv.ParseInt(nextProp, 10, 64)
			if err != nil {
				return nil, newPathDoesNotExist(path, i)
			}

			if asNum < 0 || asNum >= int64(len(casted)) {
				cursor = nil
			} else {
				cursor = casted[asNum]
			}

		case nil:
			if !optional {
				return nil, newPathDoesNotExist(path, i)
			}

			return nil, nil

		default:
			return nil, newPathDoesNotExist(path, i)
		}
	}

	return cursor, nil
}
