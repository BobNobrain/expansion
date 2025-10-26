package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type companiesTable struct {
	repo components.CompaniesRepoReadonly
	sub  *events.Subscription

	table    *dfcore.QueryableTable
	qByOwner *dfcore.TrackableTableQuery[api.CompaniesQueryByOwner]
}

func (gdf *GameDataFront) InitCompanies(repo components.CompaniesRepoReadonly) {
	if gdf.companies != nil {
		panic("GameDataFront.InitCompanies() has already been called!")
	}

	companies := &companiesTable{
		repo: repo,
		sub:  events.NewSubscription(),
	}
	companies.table = dfcore.NewQueryableTable(companies.queryByIDs)
	companies.qByOwner = dfcore.NewTrackableTableQuery(companies.queryByOwner, companies.table)

	// events.SubscribeTyped(companies.sub, events.<event>, companies.on<event>)

	gdf.companies = companies
	gdf.df.AttachTable("companies", companies.table)
	gdf.df.AttachTableQuery("companies/"+api.CompaniesQueryTypeByOwner, companies.qByOwner)
}

func (t *companiesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *companiesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	companies, err := t.repo.ResolveCompanies(utils.ConvertStrings[string, game.CompanyID](req.IDs))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(companies, identifyCompany, encodeCompany), nil
}

func (t *companiesTable) queryByOwner(
	payload api.CompaniesQueryByOwner,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	companies, err := t.repo.GetOwnedCompanies(domain.UserID(payload.OwnerID))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(companies, identifyCompany, encodeCompany), nil
}

func identifyCompany(org game.Company) dfcore.EntityID {
	return dfcore.EntityID(org.ID)
}
func encodeCompany(org game.Company) common.Encodable {
	return common.AsEncodable(api.CompaniesTableRow{
		CompanyID: string(org.ID),
		OwnerID:   string(org.OwnerID),
		Name:      org.Name,
		Created:   org.Est,
	})
}
