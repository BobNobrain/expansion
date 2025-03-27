package db

import (
	"context"
	"encoding/json"
	"fmt"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5/pgtype"
)

func parseUUID[S ~string](value S) (pgtype.UUID, common.Error) {
	uuid := pgtype.UUID{}
	err := (&uuid).Scan(string(value))
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

func (db *storageImpl) ClearTable(tableName string) error {
	_, err := db.conn.Exec(context.Background(), fmt.Sprintf("DELETE FROM %s", tableName))
	if err != nil {
		return err
	}
	return nil
}
