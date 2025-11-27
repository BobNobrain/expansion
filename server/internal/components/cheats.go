package components

import "srv/internal/utils/common"

type CheatEngine interface {
	Execute(cmd string, repos StorageRepos, context UsecaseContext) (common.Encodable, common.Error)
}
