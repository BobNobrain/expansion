package dbcore

import (
	"context"
	"srv/internal/utils/common"

	"github.com/huandu/go-sqlbuilder"
	"github.com/jmoiron/sqlx"
)

type Tx struct {
	tx         *sqlx.Tx
	successful bool
}

func (db *Conn) StartTransaction() (*Tx, common.Error) {
	tx, err := db.conn.BeginTxx(context.Background(), nil)
	if err != nil {
		return nil, makeDbError(err).withDetail("operation", "tx_start")
	}
	return &Tx{tx: tx, successful: false}, nil
}

func (tx *Tx) Commit() common.Error {
	err := tx.tx.Commit()
	if err != nil {
		return makeDbError(err).withDetail("operation", "tx_commit")
	}
	return nil
}

func (tx *Tx) Rollback() common.Error {
	err := tx.tx.Rollback()
	if err != nil {
		return makeDbError(err).withDetail("operation", "tx_rollback")
	}
	return nil
}

func (tx *Tx) Succeeded() {
	tx.successful = true
}

func (tx *Tx) Finish() common.Error {
	var err common.Error
	if tx.successful {
		err = tx.Commit()
	} else {
		err = tx.Rollback()
	}
	return err
}

func (tx *Tx) RunQuery(builder *sqlbuilder.SelectBuilder, into any) common.Error {
	query, args := builder.BuildWithFlavor(sqlbuilder.PostgreSQL)
	err := tx.tx.Select(into, query, args...)
	if err != nil {
		return makeDbError(err).
			withDetail("query", query).
			withDetail("args", args)
	}
	return nil
}

func (tx *Tx) RunStatement(builder sqlbuilder.Builder) common.Error {
	query, args := builder.BuildWithFlavor(sqlbuilder.PostgreSQL)
	_, err := tx.tx.Exec(query, args...)
	if err != nil {
		return makeDbError(err).
			withDetail("query", query).
			withDetail("args", args)
	}
	return nil
}
