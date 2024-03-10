package db

import "srv/internal/utils/common"

type dbError struct {
	inner   error
	details map[string]any
}

func makeDbError(inner error) *dbError {
	return &dbError{inner: inner, details: make(map[string]any)}
}

func (e *dbError) Error() string {
	return e.inner.Error()
}

func (e *dbError) Code() string {
	return "ERR_DB"
}

func (e *dbError) Details() common.Encodable {
	return common.AsEncodable(e.details)
}

func (e *dbError) withDetail(name string, value any) *dbError {
	e.details[name] = value
	return e
}
