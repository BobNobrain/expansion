package db

import (
	"reflect"
	"srv/internal/utils/common"

	"github.com/huandu/go-sqlbuilder"
)

func (db *dbStorage) runSelect(builder *sqlbuilder.SelectBuilder, into any) common.Error {
	query, args := builder.BuildWithFlavor(sqlbuilder.PostgreSQL)
	err := db.conn.Select(into, query, args...)
	if err != nil {
		return makeDbError(err).
			withDetail("query", query).
			withDetail("args", args)
	}
	return nil
}

func (db *dbStorage) runStatement(builder sqlbuilder.Builder) common.Error {
	query, args := builder.BuildWithFlavor(sqlbuilder.PostgreSQL)
	// fmt.Printf("SQL: '%s'", query)
	_, err := db.conn.Exec(query, args...)
	if err != nil {
		return makeDbError(err).
			withDetail("query", query).
			withDetail("args", args)
	}
	return nil
}

type repoImpl struct {
	db        *dbStorage
	tableName string
}

func makeRepoImpl(db *dbStorage, tableName string) repoImpl {
	return repoImpl{db: db, tableName: tableName}
}

func (repo *repoImpl) selectBuilder(fields ...string) *sqlbuilder.SelectBuilder {
	return sqlbuilder.Select(fields...).From(repo.tableName)
}

func (repo *repoImpl) insertBuilder() *sqlbuilder.InsertBuilder {
	return sqlbuilder.InsertInto(repo.tableName)
}

func (repo *repoImpl) insertBuilderFromValues(dbStruct interface{}) *sqlbuilder.InsertBuilder {
	builder := repo.insertBuilder()
	cols := make([]string, 0)
	values := make([]interface{}, 0)

	t := reflect.TypeOf(dbStruct)
	reflectValue := reflect.ValueOf(dbStruct)

	if t.Kind() == reflect.Pointer {
		t = t.Elem()
		reflectValue = reflectValue.Elem()
	}

	for i := 0; i < t.NumField(); i++ {
		typeField := t.Field(i)
		valueField := reflectValue.Field(i)

		tag := typeField.Tag.Get("db")
		if tag == "" {
			continue
		}

		cols = append(cols, tag)
		values = append(values, valueField.Interface())
	}

	builder.Cols(cols...)
	builder.Values(values...)

	return builder
}
