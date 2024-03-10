package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"time"
)

type AuthenticatorLoginRequest struct {
	Username domain.Username
	Password string
}
type AuthenticatorLoginResponse struct {
	User *domain.User
	Auth AuthenticatorToken
}

type AuthenticatorToken struct {
	Token   string
	Expires time.Time
}

type Authenticator interface {
	Login(AuthenticatorLoginRequest) (*AuthenticatorLoginResponse, common.Error)
	HashPassword(string) (string, common.Error)
	CheckToken(string) (*AuthenticatorLoginResponse, common.Error)
	RenewToken(string) (*AuthenticatorToken, common.Error)
}
