package transport

import "srv/pkg/api"

type TransportError struct {
	Code    string
	Message string
	Details interface{}
}

func (e *TransportError) Error() string {
	return e.Message
}

func (e *TransportError) ToApiError() *api.ApiError {
	return &api.ApiError{
		Code:    e.Code,
		Message: e.Message,
		Details: e.Details,
	}
}

func (e *TransportError) Encode() interface{} {
	return e.ToApiError()
}

func NewUnauthorizedError() *TransportError {
	return &TransportError{
		Code:    "ERR_UNAUTHORIZED",
		Message: "this action requires authorization",
	}
}

func NewBadJSONError() *TransportError {
	return &TransportError{
		Code:    "ERR_JSON",
		Message: "received bad json",
	}
}
