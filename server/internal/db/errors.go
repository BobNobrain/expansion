package db

import "srv/internal/utils/common"

type notFoundError struct {
	msg string
}

func makeNotFoundError(msg string) common.Error {
	return &notFoundError{msg: msg}
}

func (e *notFoundError) Error() string {
	return e.msg
}
func (e *notFoundError) Code() string {
	return "ERR_NOT_FOUND"
}
func (e *notFoundError) Details() common.Encodable {
	return common.EmptyEncodable()
}
func (d *notFoundError) IsRetriable() bool {
	return false
}

type dbError struct {
	inner   error
	details common.Encodable
}

func makeDBError(inner error, operation string) common.Error {
	return &dbError{inner: inner, details: common.NewDictEncodable().Set("operation", operation)}
}

func makeDBErrorWithDetails(inner error, operation string, details *common.DictEncodable) common.Error {
	return &dbError{inner: inner, details: details.Set("operation", operation)}
}

func (d *dbError) Code() string {
	return "ERR_DB"
}

func (d *dbError) Details() common.Encodable {
	return d.details
}

func (d *dbError) Error() string {
	return d.inner.Error()
}

func (d *dbError) IsRetriable() bool {
	return true
}
