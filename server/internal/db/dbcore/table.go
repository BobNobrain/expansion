package dbcore

import (
	"fmt"
	"reflect"

	"github.com/huandu/go-sqlbuilder"
)

type Table struct {
	TableName string
}

func MakeTable(tableName string) *Table {
	return &Table{TableName: tableName}
}

func (table *Table) CreateTableBuilder() *sqlbuilder.CreateTableBuilder {
	return sqlbuilder.CreateTable(table.TableName)
}

func (table *Table) SelectBuilder(fields ...string) *sqlbuilder.SelectBuilder {
	return sqlbuilder.Select(fields...).From(table.TableName)
}

func (table *Table) InsertBuilder() *sqlbuilder.InsertBuilder {
	return sqlbuilder.InsertInto(table.TableName)
}

func (table *Table) InsertBuilderFromSingleValue(dbStruct interface{}) *sqlbuilder.InsertBuilder {
	list := make([]interface{}, 0)
	list = append(list, dbStruct)
	return table.InsertBuilderFromValues(list)
}

func (table *Table) InsertBuilderFromValues(dbStructs []interface{}) *sqlbuilder.InsertBuilder {
	builder := table.InsertBuilder()
	cols := make([]string, 0)

	t := reflect.TypeOf(dbStructs[0])

	isPointer := false
	if t.Kind() == reflect.Pointer {
		t = t.Elem()
		isPointer = true
	}

	for i := 0; i < t.NumField(); i++ {
		typeField := t.Field(i)

		tag := typeField.Tag.Get("db")
		if tag == "" {
			continue
		}

		cols = append(cols, tag)
	}

	builder.Cols(cols...)

	for _, next := range dbStructs {
		t := reflect.TypeOf(next)
		reflectValue := reflect.ValueOf(next)

		if isPointer {
			reflectValue = reflectValue.Elem()
			t = t.Elem()
		}

		values := make([]interface{}, 0)

		for i := 0; i < t.NumField(); i++ {
			typeField := t.Field(i)
			valueField := reflectValue.Field(i)

			tag := typeField.Tag.Get("db")
			if tag == "" {
				continue
			}

			values = append(values, valueField.Interface())
		}

		builder.Values(values...)
	}

	return builder
}

func (table *Table) DeleteBuilder() *sqlbuilder.DeleteBuilder {
	return sqlbuilder.DeleteFrom(table.TableName)
}

func (table *Table) UpdateBuilder() *sqlbuilder.UpdateBuilder {
	return sqlbuilder.Update(table.TableName)
}

func (table *Table) Qualified(field string) string {
	return fmt.Sprintf("%s.%s", table.TableName, field)
}
