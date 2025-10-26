package components

import (
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils/common"
)

type CreateCompanyPayload struct {
	Founder domain.UserID
	Name    string
}

type CompaniesRepoReadonly interface {
	ResolveCompanies([]game.CompanyID) ([]game.Company, common.Error)

	GetCompanyData(game.CompanyID) (game.Company, common.Error)
	GetOwnedCompanies(domain.UserID) ([]game.Company, common.Error)
}

type CompaniesRepo interface {
	CompaniesRepoReadonly

	Create(CreateCompanyPayload) common.Error
}
