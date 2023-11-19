package decodables

import "srv/internal/utils/common"

type decodeError struct {
	inner error
}

func newDecodeError(inner error) common.Error {
	return &decodeError{inner: inner}
}

func (e *decodeError) Error() string {
	return e.inner.Error()
}
func (e *decodeError) Code() string {
	return "ERR_DECODE"
}
func (e *decodeError) Details() common.Encodable {
	return nil
}
