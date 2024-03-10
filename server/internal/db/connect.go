package db

import (
	"fmt"
	"srv/internal/config"

	"github.com/jmoiron/sqlx"
)

func (db *dbStorage) Open(cfg *config.SrvConfig) error {
	params := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DB.Host, cfg.DB.Port,
		cfg.DB.User, cfg.DB.Password, cfg.DB.Database,
	)
	cx, err := sqlx.Connect("postgres", params)
	if err != nil {
		return err
	}

	db.conn = cx

	return nil
}

func (db *dbStorage) IsOpen() bool {
	return db.conn != nil
}

func (db *dbStorage) Close() error {
	return db.conn.Close()
}
