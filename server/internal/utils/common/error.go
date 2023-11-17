package common

type Error interface {
	Code() string
	Error() string
	Details() Encodable
}

type unknownError struct {
	inner error
}

func NewUnknownError(e error) Error {
	return &unknownError{inner: e}
}

func (e *unknownError) Error() string {
	return e.inner.Error()
}
func (e *unknownError) Code() string {
	return "ERR_UNKNOWN"
}
func (e *unknownError) Details() Encodable {
	return nil
}
