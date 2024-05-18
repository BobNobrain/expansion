package components

import "srv/internal/utils/common"

type Runner interface {
	Start() common.Error
	Stop() common.Error
}
