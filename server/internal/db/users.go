package db

import (
	"context"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/common"
)

type userRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

func (db *userRepoImpl) CheckRoles(uid domain.UserID, roles []domain.UserRole) (map[domain.UserRole]bool, common.Error) {
	uuid, parseErr := parseUUID(string(uid))
	if parseErr != nil {
		return nil, parseErr
	}
	// TODO: also include list of roles to check in query
	userRoles, err := db.q.GetUserRoles(db.ctx, uuid)
	if err != nil {
		return nil, makeDBError(err, "UserRepo::CheckRoles")
	}

	rolesMap := make(map[domain.UserRole]bool, len(userRoles))
	for _, role := range userRoles {
		rolesMap[domain.UserRole(role.Role)] = true
	}

	return rolesMap, nil
}

func (db *userRepoImpl) Create(data components.UserCreateData) (domain.User, common.Error) {
	created, err := db.q.CreateUser(db.ctx, dbq.CreateUserParams{
		Username:     string(data.Username),
		Email:        data.Email,
		PasswordHash: data.PasswordHash,
	})

	if err != nil {
		return domain.User{}, makeDBError(err, "UserRepo::Create")
	}

	return domain.User{
		ID:       domain.UserID(created.Uid.String()),
		Username: domain.Username(created.Username),
		Email:    created.Email,
		Created:  created.CreatedAt.Time,
		Roles:    nil,
	}, nil
}

func (db *userRepoImpl) Get(rq components.GetUserRequest) (domain.User, common.Error) {
	var dbUser dbq.User
	var err error

	if !rq.UserID.IsEmpty() {
		uuid, parseErr := parseUUID(string(rq.UserID))
		if parseErr != nil {
			return domain.User{}, parseErr
		}
		dbUser, err = db.q.GetUserByID(db.ctx, uuid)
		if err != nil {
			return domain.User{}, makeDBError(err, "UserRepo::Get(UserID)")
		}
	} else if rq.Username != "" {
		dbUser, err = db.q.GetUserByUsername(db.ctx, string(rq.Username))
		if err != nil {
			return domain.User{}, makeDBError(err, "UserRepo::Get(Username)")
		}
	} else if rq.Email != "" {
		dbUser, err = db.q.GetUserByUsername(db.ctx, rq.Email)
		if err != nil {
			return domain.User{}, makeDBError(err, "UserRepo::Get(Email)")
		}
	}

	user := decodeUser(dbUser)
	if rq.WithRoles {
		roles, err := db.q.GetUserRoles(db.ctx, dbUser.Uid)
		if err != nil {
			return user, makeDBError(err, "UserRepo::Get(WithRoles)")
		}
		for _, role := range roles {
			user.Roles = append(user.Roles, domain.UserRole(role.Role))
		}
	}

	return user, nil
}

func (db *userRepoImpl) GetCredentials(username domain.Username) (domain.UserCredentials, common.Error) {
	dbCreds, err := db.q.GetCredentials(db.ctx, string(username))
	if err != nil {
		return domain.UserCredentials{}, makeDBError(err, "UserRepo::GetCredentials")
	}

	return domain.UserCredentials{
		ID:           domain.UserID(dbCreds.Uid.String()),
		Username:     domain.Username(dbCreds.Username),
		PasswordHash: dbCreds.PasswordHash,
	}, nil
}

func (db *userRepoImpl) GetManyByIDs(uids []domain.UserID) ([]domain.User, common.Error) {
	dbUsers, err := db.q.ResolveUsers(db.ctx, utils.ConvertStrings[domain.UserID, string](uids))
	if err != nil {
		return nil, makeDBError(err, "UserRepo::GetManyByIDs")
	}

	users := make([]domain.User, 0, len(dbUsers))
	for _, dbUser := range dbUsers {
		users = append(users, decodeUser(dbUser))
	}

	return users, nil
}

func (db *userRepoImpl) GetManyByUsernames([]domain.Username) ([]domain.User, common.Error) {
	// TODO: do we really need it?
	panic("unimplemented")
}

func (db *userRepoImpl) GrantRoles(rq components.ChangeRolesRequest) common.Error {
	targetUUID, parseError := parseUUID(string(rq.Target))
	if parseError != nil {
		return parseError
	}

	authorUUID, parseError := parseUUID(string(rq.Author))
	if parseError != nil {
		return parseError
	}

	for _, role := range rq.Roles {
		err := db.q.GrantRole(db.ctx, dbq.GrantRoleParams{
			Uid:       targetUUID,
			GrantedBy: authorUUID,
			Role:      string(role),
		})

		if err != nil {
			return makeDBErrorWithDetails(
				err,
				"UserRepo::GrantRoles",
				common.NewDictEncodable().
					Set("role", role).
					Set("target", rq.Target).
					Set("author", rq.Author),
			)
		}
	}

	return nil
}

func (db *userRepoImpl) RevokeRoles(rq components.ChangeRolesRequest) common.Error {
	targetUUID, parseError := parseUUID(string(rq.Target))
	if parseError != nil {
		return parseError
	}

	for _, role := range rq.Roles {
		err := db.q.RevokeRole(context.Background(), dbq.RevokeRoleParams{
			Uid:  targetUUID,
			Role: string(role),
		})

		if err != nil {
			return makeDBErrorWithDetails(
				err,
				"UserRepo::RevokeRoles",
				common.NewDictEncodable().
					Set("role", role).
					Set("target", rq.Target),
			)
		}
	}

	return nil
}

func decodeUser(dbUser dbq.User) domain.User {
	return domain.User{
		ID:       domain.UserID(dbUser.Uid.String()),
		Username: domain.Username(dbUser.Username),
		Email:    dbUser.Email,
		Created:  dbUser.CreatedAt.Time,
		Roles:    nil,
	}
}
