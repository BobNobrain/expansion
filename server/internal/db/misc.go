package db

import (
	"encoding/json"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5/pgtype"
)

func parseUUID(value string) (pgtype.UUID, common.Error) {
	uuid := pgtype.UUID{}
	err := (&uuid).Scan(value)
	return uuid, common.NewWrapperError("ERR_UUID", err)
}

func parseJSON[T any](jsonData []byte) (T, common.Error) {
	var parsed T
	err := json.Unmarshal(jsonData, &parsed)
	if err != nil {
		return parsed, common.NewWrapperError("ERR_JSON", err)
	}
	return parsed, nil
}
