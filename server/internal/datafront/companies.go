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
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	companies, err := t.repo.ResolveCompanies(utils.ConvertStrings[string, game.CompanyID](req.IDs))
	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(companies), nil
}

func (t *companiesTable) queryByOwner(
	payload api.CompaniesQueryByOwner,
	req dfapi.DFTableQueryRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	companies, err := t.repo.GetOwnedCompanies(domain.UserID(payload.OwnerID))
	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(companies), nil
}

func (t *companiesTable) IdentifyEntity(org game.Company) domain.EntityID {
	return domain.EntityID(org.ID)
}
func (t *companiesTable) EncodeEntity(org game.Company) common.Encodable {
	return common.AsEncodable(api.CompaniesTableRow{
		CompanyID: string(org.ID),
		OwnerID:   string(org.OwnerID),
		Name:      org.Name,
		Created:   org.Est,
	})
}
func (t *companiesTable) ViewFor(org game.Company, req domain.RequestContext) *game.Company {
	// TBD: clear private fields for company
	return &org
}
func (t *companiesTable) MakeCollection() domain.EntityCollectionBuilder[game.Company] {
	return domain.MakeUnorderedEntityCollection(t, t)
}
