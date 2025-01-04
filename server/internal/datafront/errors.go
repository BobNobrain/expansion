package datafront

import (
	"srv/internal/utils/common"
)

type pathNotFoundError struct {
	msg          string
	Path         DFPath
	ValidSubpath DFPath
}

func newPathNotFoundError(path DFPath, faultIndex int) *pathNotFoundError {
	var valudSubpath DFPath
	if faultIndex > 0 {
		valudSubpath = path[0:faultIndex]
	}
	return &pathNotFoundError{
		msg:          "path not found",
		Path:         path,
		ValidSubpath: valudSubpath,
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
