package db

import (
	"context"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5/pgtype"
)

type companiesRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

func (c *companiesRepoImpl) Create(payload components.CreateCompanyPayload) common.Error {
	founderUuid, err := parseUUID(payload.Founder)
	if err != nil {
		return err
	}

	dberr := c.q.CreateCompany(c.ctx, dbq.CreateCompanyParams{
		OwnerID: founderUuid,
		Name:    payload.Name,
		Logo:    []byte("{}"),
	})
	if dberr != nil {
		return makeDBError(dberr, "CompaniesRepo::Create")
	}

	return nil
}

func (c *companiesRepoImpl) GetCompanyData(id game.CompanyID) (game.Company, common.Error) {
	uuid, err := parseUUID(id)
	if err != nil {
		return game.Company{}, err
	}

	companies, dberr := c.q.ResolveCompanies(c.ctx, []pgtype.UUID{uuid})
	if dberr != nil {
		return game.Company{}, makeDBError(dberr, "CompaniesRepo::GetCompanyData")
	}
	if len(companies) != 1 {
		return game.Company{}, makeNotFoundError("Requested company does not exist")
	}

	return decodeCompany(companies[0]), nil
}

func (c *companiesRepoImpl) GetOwnedCompanies(uid domain.UserID) ([]game.Company, common.Error) {
	uuid, err := parseUUID(uid)
	if err != nil {
		return nil, err
	}

	companies, dberr := c.q.GetUserCompanies(c.ctx, uuid)
	if dberr != nil {
		return nil, makeDBError(dberr, "CompaniesRepo::GetOwnedCompanies")
	}

	return utils.MapSlice(companies, decodeCompany), nil
}

func (c *companiesRepoImpl) ResolveCompanies(ids []game.CompanyID) ([]game.Company, common.Error) {
	uuids, err := utils.MapSliceFailable(ids, parseUUID)
	if err != nil {
		return nil, err
	}

	rows, dberr := c.q.ResolveCompanies(c.ctx, uuids)
	if dberr != nil {
		return nil, makeDBError(dberr, "CompaniesRepo::ResolveOverviews")
	}

	return utils.MapSlice(rows, decodeCompany), nil
}

func decodeCompany(row dbq.Company) game.Company {
	return game.Company{
		ID:      game.CompanyID(row.ID.String()),
		Name:    row.Name,
		OwnerID: domain.UserID(row.OwnerID.String()),
		Est:     row.CreatedAt.Time,
		Logo:    nil,
	}
}
