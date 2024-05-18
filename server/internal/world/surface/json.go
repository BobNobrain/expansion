package surface

import (
	"encoding/json"
	"srv/internal/utils/common"
)

func (s *surfaceImpl) Marshall() ([]byte, common.Error) {
	bytes, err := json.Marshal(s)
	if err != nil {
		return nil, common.NewUnknownError(err)
	}
	return bytes, nil
}

func (s *surfaceImpl) Unmarshall(from []byte) common.Error {
	err := json.Unmarshal(from, s)
	if err != nil {
		return common.NewUnknownError(err)
	}
	return nil
}
