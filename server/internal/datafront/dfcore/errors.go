package dfcore

import (
	"srv/internal/utils/common"
)

type pathNotFoundError struct {
	msg  string
	Path DFPath
}

func newPathNotFoundError(path DFPath) *pathNotFoundError {
	return &pathNotFoundError{
		msg:  "path not found",
		Path: path,
	}
}

func (e *pathNotFoundError) Code() string {
	return "E_RTD_PATH"
}

// Details implements common.Error.
func (e *pathNotFoundError) Details() common.Encodable {
	return common.AsEncodable(e)
}

func (e *pathNotFoundError) Error() string {
	return e.msg
}
