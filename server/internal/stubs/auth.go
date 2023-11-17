package stubs

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"strconv"
	"time"
)

type stubAuthenticator struct {
	userRepo domain.UserRepo

	issuedTokens map[string]*domain.AuthenticatorLoginResponse
}

func NewStubAuthenticator(userRepo domain.UserRepo) domain.Authenticator {
	return &stubAuthenticator{
		userRepo:     userRepo,
		issuedTokens: make(map[string]*domain.AuthenticatorLoginResponse),
	}
}

func (impl *stubAuthenticator) Login(request domain.AuthenticatorLoginRequest) (*domain.AuthenticatorLoginResponse, common.Error) {
	creds, err := impl.userRepo.GetCredentialsByUsername(request.Username)

	if err != nil || creds.PasswordHash != stubPasswordHasher(request.Password) {
		return nil, newInvalidLoginError()
	}

	user, err := impl.userRepo.GetByUsername(request.Username)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	result := &domain.AuthenticatorLoginResponse{
		User: user,
		Auth: domain.AuthenticatorToken{
			Token:   string(user.Username) + ":" + strconv.FormatInt(now.Unix(), 10),
			Expires: now.Add(time.Hour),
		},
	}

	impl.issuedTokens[result.Auth.Token] = result

	return result, nil
}

func (impl *stubAuthenticator) CheckToken(token string) (*domain.AuthenticatorLoginResponse, common.Error) {
	result, ok := impl.issuedTokens[token]
	if !ok || time.Now().After(result.Auth.Expires) {
		return nil, newInvalidTokenError()
	}

	return result, nil
}

func (impl *stubAuthenticator) RenewToken(token string) (*domain.AuthenticatorToken, common.Error) {
	result, err := impl.CheckToken(token)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	newToken := string(result.User.Username) + ":" + strconv.FormatInt(now.Unix(), 10)

	delete(impl.issuedTokens, token)

	result.Auth.Token = newToken
	result.Auth.Expires = now.Add(time.Hour)

	impl.issuedTokens[newToken] = result

	return &result.Auth, nil
}

func stubPasswordHasher(password string) string {
	return password
}
