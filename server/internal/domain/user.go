package domain

import "fmt"

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
	GetByUsername(Username) (*User, error)
	GetCredentialsByUsername(Username) (UserCredentials, error)

	CreateUser(UserCreateData) (*User, error)
}

type UserNotFoundError struct {
	Username Username
}

func (e *UserNotFoundError) Error() string {
	return fmt.Sprintf("cannot find user with username %s", e.Username)
}

func NoUserFoundByUsername(uname Username) error {
	return &UserNotFoundError{Username: uname}
}
