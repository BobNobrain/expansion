package dbcore

import (
	"fmt"
	"srv/internal/globals/config"
	"srv/internal/utils/common"

	"github.com/huandu/go-sqlbuilder"
	"github.com/jmoiron/sqlx"
)

type Conn struct {
	conn *sqlx.DB
}

func MakeConnection() *Conn {
	return &Conn{
		conn: nil,
	}
}

func (db *Conn) Open(cfg *config.DBConfig) common.Error {
	params := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port,
		cfg.User, cfg.Password, cfg.Database,
	)
	cx, err := sqlx.Connect("postgres", params)
	if err != nil {
		return makeDbError(err).
			withDetail("operation", "connect").
			withDetail("params", params)
	}

	db.conn = cx

	return nil
}

func (db *Conn) IsOpen() bool {
	return db.conn != nil
}

func (db *Conn) Close() common.Error {
	err := db.conn.Close()
	if err != nil {
		return makeDbError(err).withDetail("operation", "close")
	}
	return nil
}

func (db *Conn) RunQuery(builder *sqlbuilder.SelectBuilder, into any) common.Error {
	query, args := builder.BuildWithFlavor(sqlbuilder.PostgreSQL)
	err := db.conn.Select(into, query, args...)
	if err != nil {
		return makeDbError(err).
			withDetail("query", query).
			withDetail("args", args)
	}
	return nil
}

func (db *Conn) RunStatement(builder sqlbuilder.Builder) common.Error {
	query, args := builder.BuildWithFlavor(sqlbuilder.PostgreSQL)
	_, err := db.conn.Exec(query, args...)
	if err != nil {
		return makeDbError(err).
			withDetail("query", query).
			withDetail("args", args)
	}
	return nil
}
