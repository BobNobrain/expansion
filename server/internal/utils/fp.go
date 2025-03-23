package utils

import "srv/internal/utils/common"

func ConvertStrings[T ~string, U ~string](ids []T) []U {
	result := make([]U, 0, len(ids))
	for _, id := range ids {
		result = append(result, U(id))
	}
	return result
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

func MapFailable[T any, U any](ts []T, f func(T) (U, common.Error)) ([]U, common.Error) {
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
