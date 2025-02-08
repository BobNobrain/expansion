package db

import (
	"context"
	"fmt"
	"os"
)

func (db *Storage) SetupCollections() error {
	const dirname = "./db/schema"

	entries, err := os.ReadDir(dirname)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if !entry.Type().IsRegular() {
			continue
		}

		fmt.Println("Reading and executing: " + entry.Name())

		contents, err := os.ReadFile(dirname + "/" + entry.Name())
		if err != nil {
			return err
		}

		_, err = db.conn.Exec(context.Background(), string(contents))
		if err != nil {
			return err
		}
	}

	return nil
}

func (db *Storage) ClearTable(tableName string) error {
	_, err := db.conn.Exec(context.Background(), fmt.Sprintf("DELETE FROM %s", tableName))
	if err != nil {
		return err
	}
	return nil
}
