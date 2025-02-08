package db

import (
	"encoding/json"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5/pgtype"
)

func parseUUID(value string) (pgtype.UUID, common.Error) {
	uuid := pgtype.UUID{}
	err := (&uuid).Scan(value)
	if err != nil {
		return uuid, common.NewDecodingError(err)
	}
	return uuid, nil
}

func parseJSON[T any](jsonData []byte) (T, common.Error) {
	var parsed T
	err := json.Unmarshal(jsonData, &parsed)
	if err != nil {
		return parsed, common.NewDecodingError(err)
	}
	return parsed, nil
}
