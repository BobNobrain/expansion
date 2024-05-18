package auth

import "srv/internal/utils/common"

type authenticationError struct {
	msg            string
	IsInvalidLogin bool
	IsInvalidToken bool
}

func (e *authenticationError) Error() string {
	return e.msg
}

func (e *authenticationError) Code() string {
	return "ERR_AUTH"
}

func (e *authenticationError) Details() common.Encodable {
	return nil
}

func newInvalidLoginError() *authenticationError {
	return &authenticationError{msg: "invalid login/password", IsInvalidLogin: true}
}
func newInvalidTokenError() *authenticationError {
	return &authenticationError{msg: "invalid/expired token", IsInvalidToken: true}
}
