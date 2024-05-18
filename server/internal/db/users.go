package db

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/db/dbcore"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"time"

	"github.com/huandu/go-sqlbuilder"
)

type userRepoImpl struct {
	db *dbcore.Conn

	users *dbcore.Table
	roles *dbcore.Table
}

func newUserRepo(db *dbcore.Conn) *userRepoImpl {
	return &userRepoImpl{
		db:    db,
		users: dbcore.MakeTable("users"),
		roles: dbcore.MakeTable("user_roles"),
	}
}

const (
	userFieldID           = "uid"
	userFieldUsername     = "username"
	userFieldEmail        = "email"
	userFieldPasswordHash = "password_hash"
	userFieldCreatedAt    = "created_at"
	userFieldUpdatedAt    = "updated_at"

	userRolesFieldID        = "id"
	userRolesFieldUserID    = "uid"
	userRolesFieldRole      = "role"
	userRolesFieldGrantedAt = "granted_at"
	userRolesFieldGrantedBy = "granted_by"
)

type dbUser struct {
	ID           string    `db:"uid"`
	Username     string    `db:"username"`
	Email        string    `db:"email"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
	Roles        []string  `db:"roles"`
}

type dbUserRole struct {
	ID        int       `db:"id"`
	UserID    string    `db:"uid"`
	Role      string    `db:"role"`
	GrantedAt time.Time `db:"granted_at"`
	GrantedBy string    `db:"granted_by"`
}

type dbUserInsert struct {
	Username     string `db:"username"`
	Email        string `db:"email"`
	PasswordHash string `db:"password_hash"`
}

type dbUserRoleInsert struct {
	UserID    string `db:"uid"`
	Role      string `db:"role"`
	GrantedBy string `db:"granted_by"`
}

func (data *dbUser) toUser() domain.User {
	if data == nil {
		return domain.User{}
	}

	roles := make([]domain.UserRole, len(data.Roles))
	for _, role := range data.Roles {
		roles = append(roles, domain.UserRole(role))
	}

	return domain.User{
		ID:       domain.UserID(data.ID),
		Username: domain.Username(data.Username),
		Email:    data.Email,
		Roles:    roles,
	}
}
func (data *dbUser) toCredentials() domain.UserCredentials {
	if data == nil {
		return domain.UserCredentials{}
	}
	return domain.UserCredentials{
		Username:     domain.Username(data.Username),
		PasswordHash: data.PasswordHash,
	}
}

func (repo *userRepoImpl) getUsersSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	users := repo.users.CreateTableBuilder()
	users.Define(userFieldID, "UUID", "PRIMARY KEY", "DEFAULT gen_random_uuid()")
	users.Define(userFieldUsername, "TEXT", "UNIQUE", "NOT NULL")
	users.Define(userFieldEmail, "TEXT", "UNIQUE", "NOT NULL")
	users.Define(userFieldPasswordHash, "TEXT", "NOT NULL")
	users.Define(userFieldCreatedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")
	users.Define(userFieldUpdatedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")
	return users
}
func (repo *userRepoImpl) getRolesSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	roles := repo.roles.CreateTableBuilder()
	roles.Define(userRolesFieldID, "SERIAL", "PRIMARY KEY")
	roles.Define(userRolesFieldUserID, "UUID", "NOT NULL")
	roles.Define(userRolesFieldRole, "TEXT", "NOT NULL")
	roles.Define(userRolesFieldGrantedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")
	roles.Define(userRolesFieldGrantedBy, "UUID", "NOT NULL")
	return roles
}

func (repo *userRepoImpl) List() ([]domain.User, common.Error) {
	builder := repo.users.SelectBuilder("*")
	var rows []*dbUser
	err := repo.db.RunQuery(builder, &rows)

	if err != nil {
		return nil, err
	}

	result := make([]domain.User, len(rows))
	for i := 0; i < len(rows); i++ {
		result[i] = rows[i].toUser()
	}

	return result, nil
}

func (repo *userRepoImpl) Get(rq components.GetUserRequest) (domain.User, common.Error) {
	fields := []string{repo.users.Qualified(userFieldID), userFieldUsername, userFieldEmail}
	if rq.WithRoles {
		fields = append(fields, fmt.Sprintf("json_agg(%s)", userRolesFieldRole))
	}

	builder := repo.users.SelectBuilder(fields...)

	if rq.WithRoles {
		builder.JoinWithOption(
			sqlbuilder.LeftJoin,
			repo.roles.TableName,
			fmt.Sprintf("%s.%s = %s.%s", repo.users.TableName, userFieldID, repo.roles.TableName, userRolesFieldUserID),
		)
	}

	if rq.UserID != "" {
		builder.Where(builder.Equal(repo.users.Qualified(userFieldID), rq.UserID))
	}
	if rq.Username != "" {
		builder.Where(builder.Equal(userFieldUsername, rq.Username))
	}
	if rq.Email != "" {
		builder.Where(builder.Equal(userFieldEmail, rq.Email))
	}

	if rq.WithRoles {
		builder.GroupBy(repo.users.Qualified(userFieldID), userFieldUsername, userFieldEmail)
	}

	var rows []*dbUser

	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return domain.User{}, err
	}

	if len(rows) < 1 {
		return domain.User{}, makeNotFoundError("user not found")
	}

	return rows[0].toUser(), nil
}

func (repo *userRepoImpl) GetCredentials(uname domain.Username) (domain.UserCredentials, common.Error) {
	builder := repo.users.SelectBuilder("*")
	builder.Where(builder.Equal(userFieldUsername, uname))

	var rows []*dbUser

	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return domain.UserCredentials{}, err
	}

	if len(rows) < 1 {
		return domain.UserCredentials{}, makeNotFoundError(fmt.Sprintf("user '%s' not found", uname))
	}

	return rows[0].toCredentials(), nil
}

func (c *userRepoImpl) Create(data components.UserCreateData) (domain.User, common.Error) {
	builder := c.users.InsertBuilderFromSingleValue(dbUserInsert{
		Username:     string(data.Username),
		Email:        data.Email,
		PasswordHash: data.PasswordHash,
	})

	err := c.db.RunStatement(builder)
	if err != nil {
		return domain.User{}, err
	}

	return c.Get(components.GetUserRequest{Username: data.Username})
}

func (c *userRepoImpl) GrantRoles(rq components.ChangeRolesRequest) common.Error {
	newEntries := make([]interface{}, len(rq.Roles))

	for _, role := range rq.Roles {
		newEntries = append(newEntries, &dbUserRoleInsert{
			UserID:    string(rq.Target),
			Role:      string(role),
			GrantedBy: string(rq.Author),
		})
	}

	builder := c.roles.InsertBuilderFromValues(newEntries)
	return c.db.RunStatement(builder)
}

func (c *userRepoImpl) RevokeRoles(rq components.ChangeRolesRequest) common.Error {
	builder := c.roles.DeleteBuilder()
	builder.Where(builder.Equal(userRolesFieldUserID, rq.Target))

	roleEquations := make([]string, len(rq.Roles))
	for _, role := range rq.Roles {
		roleEquations = append(roleEquations, builder.Equal(userRolesFieldRole, role))
	}

	builder.Where(builder.Or(roleEquations...))

	return c.db.RunStatement(builder)
}

func (c *userRepoImpl) CheckRoles(uid domain.UserID, roles []domain.UserRole) (map[domain.UserRole]bool, common.Error) {
	builder := c.roles.SelectBuilder(userRolesFieldRole)
	builder.Where(builder.Equal(userRolesFieldUserID, uid))

	roleEquations := make([]string, len(roles))
	for _, role := range roles {
		roleEquations = append(roleEquations, builder.Equal(userRolesFieldRole, role))
	}
	builder.Where(builder.Or(roleEquations...))

	result := make(map[domain.UserRole]bool)
	var rows []*dbUserRole

	err := c.db.RunQuery(builder, &rows)
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		role := domain.UserRole(row.Role)
		result[role] = true
	}

	return result, nil
}
