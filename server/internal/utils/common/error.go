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
	return EmptyEncodable()
}

type customError struct {
	msg     string
	code    string
	details Encodable
	inner   error
}

func NewError(code string, msg string) Error {
	return &customError{
		code:    code,
		msg:     msg,
		details: EmptyEncodable(),
	}
}

func NewWrapperError(code string, inner error) Error {
	return &customError{
		code:    code,
		msg:     inner.Error(),
		inner:   inner,
		details: EmptyEncodable(),
	}
}

func NewErrorWithDetails(code string, msg string, details Encodable) Error {
	return &customError{
		code:    code,
		msg:     msg,
		details: details,
	}
}

func (e *customError) Error() string {
	return e.msg
}
func (e *customError) Code() string {
	return e.code
}
func (e *customError) Details() Encodable {
	return e.details
}
