package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type UserCreateData struct {
	Username     domain.Username
	Email        string
	PasswordHash string
}

type GetUserRequest struct {
	UserID   domain.UserID
	Username domain.Username
	Email    string

	WithRoles bool
}

type ChangeRolesRequest struct {
	Target domain.UserID
	Roles  []domain.UserRole
	Author domain.UserID
}

type UserRepo interface {
	Get(GetUserRequest) (domain.User, common.Error)
	GetManyByIDs([]domain.UserID) ([]domain.User, common.Error)
	GetManyByUsernames([]domain.Username) ([]domain.User, common.Error)
	GetCredentials(domain.Username) (domain.UserCredentials, common.Error)

	Create(UserCreateData) (domain.User, common.Error)

	GrantRoles(ChangeRolesRequest) common.Error
	RevokeRoles(ChangeRolesRequest) common.Error

	CheckRoles(domain.UserID, []domain.UserRole) (map[domain.UserRole]bool, common.Error)
}
