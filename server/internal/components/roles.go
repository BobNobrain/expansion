package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type RolesRepo interface {
	GrantRoles(domain.UserID, []domain.UserRole) common.Error
	RevokeRoles(domain.UserID, []domain.UserRole) common.Error

	CheckRoles(domain.UserID, []domain.UserRole) (map[domain.UserRole]bool, common.Error)
}
