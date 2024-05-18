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
