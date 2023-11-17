package domain

import (
	"srv/internal/utils/common"
)

type Username string

type User struct {
	Username Username `json:"username"`
}

type UserCreateData struct {
	Username Username `json:"username"`
	Password string   `json:"password"`
}

type UserCredentials struct {
	Username     Username
	PasswordHash string
}

type UserRepo interface {
	GetByUsername(Username) (*User, common.Error)
	GetCredentialsByUsername(Username) (UserCredentials, common.Error)

	CreateUser(UserCreateData) (*User, common.Error)
}
