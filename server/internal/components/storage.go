package components

import (
	"context"
	"srv/internal/utils/common"
)

type Storage interface {
	StartTransaction(context.Context) (StorageRepos, common.Error)
	Dispose()

	Users() UserRepoReadonly
	Companies() CompaniesRepoReadonly
	Systems() StarSystemsRepoReadonly
	Worlds() WorldsRepoReadonly
	Cities() CitiesRepoReadonly
	Bases() BasesRepoReadonly
	Factories() FactoriesRepoReadonly

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
	Bases() BasesRepo
	Factories() FactoriesRepo
}
