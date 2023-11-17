package stubs

import (
	"fmt"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

type userNotFoundError struct {
	Username domain.Username
}

func (e *userNotFoundError) Error() string {
	return fmt.Sprintf("cannot find user with username %s", e.Username)
}

func (e *userNotFoundError) Code() string {
	return "ERR_USER_NOT_FOUND"
}

func (e *userNotFoundError) Details() common.Encodable {
	return encodables.NewDebugEncodable().Add("username", string(e.Username))
}

func newUserNotFoundError(uname domain.Username) common.Error {
	return &userNotFoundError{Username: uname}
}
