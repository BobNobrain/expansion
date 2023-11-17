package domain

import (
	"srv/internal/utils/common"
	"time"
)

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
	Login(AuthenticatorLoginRequest) (*AuthenticatorLoginResponse, common.Error)
	CheckToken(string) (*AuthenticatorLoginResponse, common.Error)
	RenewToken(string) (*AuthenticatorToken, common.Error)
}
