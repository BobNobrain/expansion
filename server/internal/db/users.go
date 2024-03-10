package db

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"time"

	"github.com/huandu/go-sqlbuilder"
)

type userRepoImpl struct {
	repoImpl
}

func newUserRepo(db *dbStorage) *userRepoImpl {
	return &userRepoImpl{
		repoImpl: makeRepoImpl(db, "users"),
	}
}

const (
	userFieldID           = "uid"
	userFieldUsername     = "username"
	userFieldPasswordHash = "password_hash"
	userFieldCreatedAt    = "created_at"
	userFieldUpdatedAt    = "updated_at"
)

type dbUser struct {
	ID           string    `db:"uid"`
	Username     string    `db:"username"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

type dbUserInsert struct {
	Username     string `db:"username"`
	PasswordHash string `db:"password_hash"`
}

func (data *dbUser) toUser() *domain.User {
	if data == nil {
		return nil
	}
	return &domain.User{
		ID:       domain.UserID(data.ID),
		Username: domain.Username(data.Username),
	}
}
func (data *dbUser) toCredentials() *domain.UserCredentials {
	if data == nil {
		return nil
	}
	return &domain.UserCredentials{
		Username:     domain.Username(data.Username),
		PasswordHash: data.PasswordHash,
	}
}

func (repo *userRepoImpl) getSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	users := sqlbuilder.CreateTable(repo.tableName)
	users.Define(userFieldID, "UUID", "PRIMARY KEY", "DEFAULT gen_random_uuid()")
	users.Define(userFieldUsername, "TEXT", "UNIQUE", "NOT NULL")
	users.Define(userFieldPasswordHash, "TEXT", "NOT NULL")
	users.Define(userFieldCreatedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")
	users.Define(userFieldUpdatedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")
	return users
}

func (repo *userRepoImpl) List() ([]*domain.User, common.Error) {
	builder := repo.selectBuilder("*")
	var rows []*dbUser
	err := repo.db.runSelect(builder, &rows)

	if err != nil {
		return nil, err
	}

	result := make([]*domain.User, len(rows))
	for i := 0; i < len(rows); i++ {
		result[i] = rows[i].toUser()
	}

	return result, nil
}

func (repo *userRepoImpl) GetByID(uid domain.UserID) (*domain.User, common.Error) {
	builder := repo.selectBuilder("*")
	builder.Where(builder.Equal(userFieldID, uid))

	var rows []*dbUser

	err := repo.db.runSelect(builder, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) < 1 {
		return nil, nil
	}

	return rows[0].toUser(), nil
}

func (repo *userRepoImpl) GetByUsername(uname domain.Username) (*domain.User, common.Error) {
	builder := repo.selectBuilder("*")
	builder.Where(builder.Equal(userFieldUsername, uname))

	var rows []*dbUser

	err := repo.db.runSelect(builder, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) < 1 {
		return nil, nil
	}

	return rows[0].toUser(), nil
}

func (repo *userRepoImpl) GetCredentialsByUsername(uname domain.Username) (*domain.UserCredentials, common.Error) {
	builder := repo.selectBuilder("*")
	builder.Where(builder.Equal(userFieldUsername, uname))

	var rows []*dbUser

	err := repo.db.runSelect(builder, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) < 1 {
		return nil, nil
	}

	return rows[0].toCredentials(), nil
}

func (c *userRepoImpl) CreateUser(data domain.UserCreateData) (*domain.User, common.Error) {
	builder := c.insertBuilderFromValues(dbUserInsert{
		Username:     string(data.Username),
		PasswordHash: data.PasswordHash,
	})

	err := c.db.runStatement(builder)
	if err != nil {
		return nil, err
	}

	return c.GetByUsername(data.Username)
}
