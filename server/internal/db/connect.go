package db

import (
	"srv/internal/globals/config"
	"srv/internal/utils/common"
)

func (db *Storage) Open() common.Error {
	return db.conn.Open(config.DB())
}

func (db *Storage) IsOpen() bool {
	return db.conn.IsOpen()
}

func (db *Storage) Close() common.Error {
	return db.conn.Close()
}
