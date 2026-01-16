package components

import (
	"context"
	"srv/internal/utils/common"
)

type GlobalRepos interface {
	StartTransaction(context.Context) (GlobalReposTx, common.Error)
}

type GlobalReposReadonly interface {
	GlobalRepos

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

type GlobalReposTx interface {
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
