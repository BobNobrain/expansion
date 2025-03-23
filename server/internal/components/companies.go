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

type CompaniesRepo interface {
	Create(CreateCompanyPayload) (game.CompanyOverview, common.Error)
	ResolveOverviews([]game.CompanyID) (map[game.CompanyID]game.CompanyOverview, common.Error)

	GetCompanyData(game.CompanyID) (game.CompanyData, common.Error)
}
