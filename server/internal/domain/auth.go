package domain

import "time"

type AuthenticatorLoginRequest struct {
	Username Username `json:"username"`
	Password string   `json:"password"`
}
type AuthenticatorLoginResponse struct {
	User *User              `json:"user"`
	Auth AuthenticatorToken `json:"auth"`
}

type AuthenticatorToken struct {
	Token   string    `json:"token"`
	Expires time.Time `json:"expires"`
}

type Authenticator interface {
	Login(AuthenticatorLoginRequest) (*AuthenticatorLoginResponse, error)
	CheckToken(string) (*AuthenticatorLoginResponse, error)
	RenewToken(string) (*AuthenticatorToken, error)
}

type AuthenticationError struct {
	msg            string
	IsInvalidLogin bool
	IsInvalidToken bool
}

func (e AuthenticationError) Error() string {
	return e.msg
}

func NewInvalidLoginError() *AuthenticationError {
	return &AuthenticationError{msg: "invalid login/password", IsInvalidLogin: true}
}
func NewInvalidTokenError() *AuthenticationError {
	return &AuthenticationError{msg: "invalid/expired token", IsInvalidToken: true}
}
