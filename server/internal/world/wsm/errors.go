package wsm

import "srv/internal/utils/common"

func newLoadError(inner error) common.Error {
	return common.NewWrapperError("ERR_STATE_LOAD", inner)
}

func newSaveError(inner error) common.Error {
	return common.NewWrapperError("ERR_STATE_SAVE", inner)
}
