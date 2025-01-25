package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/world"
)

type CreateCompanyPayload struct {
	Founder domain.UserID
	Name    string
}

type CompaniesRepo interface {
	Create(CreateCompanyPayload) (world.CompanyOverview, common.Error)
	ResolveOverviews([]world.CompanyID) (map[world.CompanyID]world.CompanyOverview, common.Error)

	GetCompanyData(world.CompanyID) (world.CompanyData, common.Error)
}
