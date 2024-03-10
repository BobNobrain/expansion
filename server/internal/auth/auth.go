package auth

import (
	"srv/internal/components"
	"srv/internal/config"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type authenticator struct {
	userRepo domain.UserRepo
	jwtKey   []byte
}

func NewAuthenticator(users domain.UserRepo, cfg *config.SrvConfig) components.Authenticator {
	return &authenticator{
		userRepo: users,
		jwtKey:   []byte(cfg.AuthJWTSecret),
	}
}

func (impl *authenticator) HashPassword(password string) (string, common.Error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)

	if err != nil {
		return "", common.NewUnknownError(err)
	}

	return string(bytes), nil
}

func (impl *authenticator) Login(request components.AuthenticatorLoginRequest) (*components.AuthenticatorLoginResponse, common.Error) {
	creds, err := impl.userRepo.GetCredentialsByUsername(request.Username)
	if err != nil {
		return nil, newInvalidLoginError()
	}

	bcryptErr := bcrypt.CompareHashAndPassword([]byte(creds.PasswordHash), []byte(request.Password))
	if bcryptErr != nil {
		return nil, newInvalidLoginError()
	}

	user, err := impl.userRepo.GetByUsername(request.Username)
	if err != nil {
		return nil, err
	}

	token, err := impl.makeToken(user)
	if err != nil {
		return nil, common.NewUnknownError(err)
	}

	result := &components.AuthenticatorLoginResponse{
		User: user,
		Auth: components.AuthenticatorToken{
			Token:   token,
			Expires: time.Now().Add(time.Hour),
		},
	}

	return result, nil
}

func (impl *authenticator) CheckToken(token string) (*components.AuthenticatorLoginResponse, common.Error) {
	parsed, err := jwt.ParseWithClaims(token, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
		return impl.jwtKey, nil
	}, jwt.WithExpirationRequired(), jwt.WithLeeway(time.Second*30))

	if err != nil {
		return nil, newInvalidTokenError()
	}

	username, err := parsed.Claims.GetSubject()
	if err != nil {
		return nil, newInvalidTokenError()
	}

	user, cerr := impl.userRepo.GetByUsername(domain.Username(username))
	if cerr != nil {
		return nil, cerr
	}
	if user == nil {
		return nil, newInvalidTokenError()
	}

	expires, err := parsed.Claims.GetExpirationTime()
	if err != nil {
		// ignore the error
		expires.Time = time.Now().Add(time.Hour)
	}

	return &components.AuthenticatorLoginResponse{
		User: user,
		Auth: components.AuthenticatorToken{
			Token:   token,
			Expires: expires.Time,
		},
	}, nil
}

func (impl *authenticator) RenewToken(token string) (*components.AuthenticatorToken, common.Error) {
	result, err := impl.CheckToken(token)
	if err != nil {
		return nil, err
	}

	newToken, err := impl.makeToken(result.User)
	if err != nil {
		return nil, err
	}

	result.Auth.Token = newToken

	return &result.Auth, nil
}

func (impl *authenticator) makeToken(user *domain.User) (string, common.Error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.Username,
		"exp": time.Now().UTC().Add(time.Hour).Unix(),
	})
	str, err := t.SignedString(impl.jwtKey)
	if err != nil {
		return "", common.NewUnknownError(err)
	}
	return str, nil
}
