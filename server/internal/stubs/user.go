package stubs

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"sync"
)

type stubUserRepo struct {
	mu    sync.Mutex
	users []userData
}

func NewStubUserRepo() domain.UserRepo {
	users := make([]userData, 0)
	users = append(users, userData{
		id:           "bob",
		uname:        "bob",
		passwordHash: "111",
	})
	users = append(users, userData{
		id:           "alice",
		uname:        "alice",
		passwordHash: "222",
	})
	users = append(users, userData{
		id:           "eve",
		uname:        "eve",
		passwordHash: "333",
	})
	users = append(users, userData{
		id:           "joe",
		uname:        "joe",
		passwordHash: "444",
	})

	return &stubUserRepo{
		mu:    sync.Mutex{},
		users: users,
	}
}

func (impl *stubUserRepo) GetByID(uid domain.UserID) (*domain.User, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	for _, u := range impl.users {
		if u.id == uid {
			return u.toUser(), nil
		}
	}

	return nil, nil
}

func (impl *stubUserRepo) GetByUsername(uname domain.Username) (*domain.User, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	for _, u := range impl.users {
		if u.uname == uname {
			return u.toUser(), nil
		}
	}

	return nil, nil
}

func (impl *stubUserRepo) GetCredentialsByUsername(uname domain.Username) (*domain.UserCredentials, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	for _, u := range impl.users {
		if u.uname == uname {
			return u.getCreds(), nil
		}
	}

	return nil, newUserNotFoundError(uname)
}

func (impl *stubUserRepo) CreateUser(ucd domain.UserCreateData) (*domain.User, common.Error) {
	impl.mu.Lock()
	defer impl.mu.Unlock()

	newUser := userData{
		uname:        ucd.Username,
		passwordHash: ucd.PasswordHash,
	}

	impl.users = append(impl.users, newUser)
	return newUser.toUser(), nil
}

type userData struct {
	id           domain.UserID
	uname        domain.Username
	passwordHash string
}

func (udata userData) toUser() *domain.User {
	return &domain.User{
		Username: udata.uname,
	}
}
func (udata userData) getCreds() *domain.UserCredentials {
	return &domain.UserCredentials{
		Username:     udata.uname,
		PasswordHash: udata.passwordHash,
	}
}
