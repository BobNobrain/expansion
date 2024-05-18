package db

import (
	"srv/internal/db/dbcore"
	"srv/internal/domain"
	"srv/internal/utils/common"

	"github.com/huandu/go-sqlbuilder"
)

type orgRepoImpl struct {
	db   *dbcore.Conn
	orgs *dbcore.Table
}

func newOrgRepo(db *dbcore.Conn) *orgRepoImpl {
	return &orgRepoImpl{db: db, orgs: dbcore.MakeTable("orgs")}
}

const (
	orgFieldID      = "org_id"
	orgFieldName    = "name"
	orgFieldTicker  = "ticker"
	orgFieldOwnerID = "owner_id"
)

type dbOrg struct {
	ID      string `db:"org_id"`
	Name    string `db:"name"`
	Ticker  string `db:"ticker"`
	OwnerID string `db:"owner_id"`
}

func (data *dbOrg) toOrg() *domain.Org {
	return &domain.Org{
		ID:      domain.OrgID(data.ID),
		Name:    data.Name,
		Ticker:  data.Ticker,
		OwnerID: domain.UserID(data.OwnerID),
	}
}

func (repo *orgRepoImpl) getSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	orgs := repo.orgs.CreateTableBuilder()
	orgs.Define(orgFieldID, "UUID", "PRIMARY KEY", "DEFAULT gen_random_uuid()")
	orgs.Define(orgFieldTicker, "TEXT", "UNIQUE", "NOT NULL")
	orgs.Define(orgFieldName, "TEXT", "NOT NULL")
	orgs.Define(orgFieldOwnerID, "UUID", "NOT NULL")
	return orgs
}

func (repo *orgRepoImpl) GetByID(domain.OrgID) (*domain.Org, common.Error) {
	builder := repo.orgs.SelectBuilder("*")
	var rows []*dbOrg
	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) < 1 {
		return nil, nil
	}

	return rows[0].toOrg(), nil
}
