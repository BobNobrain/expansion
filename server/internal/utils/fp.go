package utils

import (
	"srv/internal/utils/common"
	"strconv"
)

func ConvertStrings[T ~string, U ~string](ids []T) []U {
	result := make([]U, 0, len(ids))
	for _, id := range ids {
		result = append(result, U(id))
	}
	return result
}

func ConvertStringKeys[K1 ~string, K2 ~string, V any](m map[K1]V) map[K2]V {
	if m == nil {
		return nil
	}

	dest := make(map[K2]V)
	for k, v := range m {
		dest[K2(k)] = v
	}
	return dest
}

type Integer interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64
}

func ConvertInts[T Integer, U Integer](ids []T) []U {
	result := make([]U, 0, len(ids))
	for _, id := range ids {
		result = append(result, U(id))
	}
	return result
}
func ParseInts[T Integer](ids []string) []T {
	result := make([]T, 0, len(ids))
	for _, id := range ids {
		parsed, err := strconv.Atoi(id)
		if err != nil {
			continue
		}

		result = append(result, T(parsed))
	}
	return result
}

func MapSlice[T any, U any](ts []T, f func(T) U) []U {
	if ts == nil {
		return nil
	}

	us := make([]U, 0, len(ts))
	for _, t := range ts {
		us = append(us, f(t))
	}
	return us
}

func MapSliceFailable[T any, U any](ts []T, f func(T) (U, common.Error)) ([]U, common.Error) {
	if ts == nil {
		return nil, nil
	}

	us := make([]U, 0, len(ts))
	for _, t := range ts {
		u, err := f(t)
		if err != nil {
			return nil, err
		}

		us = append(us, u)
	}
	return us, nil
}

func MapKeys[K1 comparable, K2 comparable, V any](src map[K1]V, f func(K1) K2) map[K2]V {
	if src == nil {
		return nil
	}

	dest := make(map[K2]V)
	for k, v := range src {
		dest[f(k)] = v
	}
	return dest
}

func MapValues[K comparable, V1 any, V2 any](src map[K]V1, f func(V1) V2) map[K]V2 {
	if src == nil {
		return nil
	}

	dest := make(map[K]V2)
	for k, v := range src {
		dest[k] = f(v)
	}
	return dest
}

func GetMapKeys[K comparable, V any](m map[K]V) []K {
	if m == nil {
		return nil
	}

	keys := make([]K, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// Returns s if it is not nil, otherwise creates an empty slice and returns it instead
func UnNilSlice[T any](s []T) []T {
	if s == nil {
		return make([]T, 0)
	}

	return s
}
