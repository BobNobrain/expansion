package components

import (
	"context"
	"srv/internal/utils/common"
)

type Storage interface {
	StartTransaction(context.Context) (StorageRepos, common.Error)
	Dispose()

	Users() UserRepoReadonly
	Systems() StarSystemsRepoReadonly
	Worlds() WorldsRepoReadonly
	Cities() CitiesRepoReadonly

	// TODO: separate this method into some other interface like DevStorage
	// ! Warning: this method must be used for fixtures only
	ClearTable(string) error
}

type StorageRepos interface {
	Commit() common.Error
	Rollback() common.Error

	Users() UserRepo
	Companies() CompaniesRepo
	Systems() StarSystemsRepo
	Worlds() WorldsRepo
	Cities() CitiesRepo
}
