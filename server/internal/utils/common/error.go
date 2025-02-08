package common

type Error interface {
	Code() string
	Error() string
	IsRetriable() bool
	Details() Encodable
}

type customError struct {
	msg         string
	code        string
	details     Encodable
	inner       error
	isRetriable bool
}

func (e *customError) Error() string {
	return e.msg
}
func (e *customError) Code() string {
	return e.code
}
func (e *customError) IsRetriable() bool {
	return e.isRetriable
}
func (e *customError) Details() Encodable {
	return e.details
}

type errorConstructor func(*customError)

func NewError(options ...errorConstructor) Error {
	err := &customError{
		code:        "ERR_UNKNOWN",
		msg:         "something terribly wrong happened",
		inner:       nil,
		details:     EmptyEncodable(),
		isRetriable: false,
	}
	for _, opt := range options {
		opt(err)
	}
	return err
}

func WithCode(code string) errorConstructor {
	return func(ce *customError) {
		ce.code = code
	}
}
func WithMessage(msg string) errorConstructor {
	return func(ce *customError) {
		ce.msg = msg
	}
}
func WithDetails(details Encodable) errorConstructor {
	return func(ce *customError) {
		ce.details = details
	}
}
func WithInnerError(inner error) errorConstructor {
	return func(ce *customError) {
		ce.inner = inner
		ce.msg = inner.Error()
	}
}
func WithRetriable(ce *customError) {
	ce.isRetriable = true
}

func NewUnknownError(e error) Error {
	return NewError(WithInnerError(e))
}
func NewValidationError(field string, msg string, opts ...errorConstructor) Error {
	return NewError(WithCode("ERR_VALIDATION"), WithMessage(msg), WithDetails(NewDictEncodable().Set("field", field)))
}
func NewDecodingError(inner error) Error {
	return NewError(WithCode("ERR_DECODE"), WithInnerError(inner))
}
