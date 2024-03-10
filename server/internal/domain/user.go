package domain

import (
	"srv/internal/utils/common"
)

type Username string
type UserID string

type User struct {
	ID       UserID
	Username Username
	Email    string
}

type UserCreateData struct {
	Username     Username
	Email        string
	PasswordHash string
}

type UserCredentials struct {
	Username     Username
	PasswordHash string
}

type UserRepo interface {
	GetByID(UserID) (*User, common.Error)
	GetByUsername(Username) (*User, common.Error)
	GetCredentialsByUsername(Username) (*UserCredentials, common.Error)

	CreateUser(UserCreateData) (*User, common.Error)
}
