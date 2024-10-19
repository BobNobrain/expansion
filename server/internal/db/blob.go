package db

import (
	"srv/internal/db/dbcore"
	"srv/internal/domain"
	"srv/internal/utils/common"

	"github.com/huandu/go-sqlbuilder"
)

type blobRepoImpl struct {
	db    *dbcore.Conn
	table *dbcore.Table
	json  bool
}

func newBlobRepo(db *dbcore.Conn, tableName string, useJson bool) *blobRepoImpl {
	return &blobRepoImpl{
		db:    db,
		table: dbcore.MakeTable(tableName),
		json:  useJson,
	}
}

const (
	blobFieldID        = "blob_id"
	blobFieldFormat    = "blob_format"
	blobFieldVersion   = "blob_version"
	blobFieldData      = "blob_data"
	blobFieldUpdatedAt = "blob_updated_at"
)

var blobSelectFields = []string{blobFieldID, blobFieldFormat, blobFieldVersion, blobFieldData}

type dbBlob struct {
	ID      string `db:"blob_id"`
	Format  string `db:"blob_format"`
	Version int32  `db:"blob_version"`
	Data    []byte `db:"blob_data"`
}

func (blob dbBlob) toDomain() *domain.OpaqueBlob {
	return &domain.OpaqueBlob{
		ID:      blob.ID,
		Format:  blob.Format,
		Version: blob.Version,
		Data:    blob.Data,
	}
}

func (repo *blobRepoImpl) getBlobSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	blobs := repo.table.CreateTableBuilder()
	blobs.Define(blobFieldID, "VARCHAR(31)", "PRIMARY KEY", "NOT NULL")

	blobs.Define(blobFieldFormat, "VARCHAR(63)", "NOT NULL")
	blobs.Define(blobFieldVersion, "INTEGER", "NOT NULL")
	if repo.json {
		blobs.Define(blobFieldData, "JSONB", "NOT NULL")
	} else {
		blobs.Define(blobFieldData, "BYTEA", "NOT NULL")
	}

	blobs.Define(blobFieldUpdatedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")

	return blobs
}

func (repo *blobRepoImpl) Create(value *domain.OpaqueBlob) common.Error {
	insertion := repo.table.InsertBuilderFromSingleValue(&dbBlob{
		ID:      value.ID,
		Format:  value.Format,
		Version: value.Version,
		Data:    value.Data,
	})
	return repo.db.RunStatement(insertion)
}

func (repo *blobRepoImpl) Get(id string) (*domain.OpaqueBlob, common.Error) {
	query := repo.table.SelectBuilder(blobSelectFields...)
	query.Where(query.Equal(blobFieldID, id))
	query.Limit(1)

	var rows []dbBlob
	err := repo.db.RunQuery(query, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) != 1 {
		return nil, nil
	}

	return rows[0].toDomain(), nil
}

func (repo *blobRepoImpl) GetMany(ids []string) ([]*domain.OpaqueBlob, common.Error) {
	query := repo.table.SelectBuilder(blobSelectFields...)
	if len(ids) > 0 {
		query.Where(query.In(blobFieldID, ids))
	}

	var rows []dbBlob
	err := repo.db.RunQuery(query, &rows)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.OpaqueBlob, len(rows))
	for i, row := range rows {
		result[i] = row.toDomain()
	}

	return result, nil
}

func (repo *blobRepoImpl) Clear() common.Error {
	return repo.db.RunStatement(repo.table.DeleteBuilder())
}

func (repo *blobRepoImpl) Update(value *domain.OpaqueBlob) common.Error {
	updater := repo.table.UpdateBuilder()
	updater.Where(updater.Equal(blobFieldID, value.ID))

	updater.Set(updater.Assign(blobFieldVersion, value.Version))
	updater.Set(updater.Assign(blobFieldFormat, value.Format))
	updater.Set(updater.Assign(blobFieldData, value.Data))

	return repo.db.RunStatement(updater)
}

func (repo *blobRepoImpl) GetAllOfFormat(format string) ([]*domain.OpaqueBlob, common.Error) {
	query := repo.table.SelectBuilder(blobSelectFields...)
	query.Where(query.In(blobFieldFormat, format))

	var rows []dbBlob
	err := repo.db.RunQuery(query, &rows)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.OpaqueBlob, len(rows))
	for i, row := range rows {
		result[i] = row.toDomain()
	}

	return result, nil
}
