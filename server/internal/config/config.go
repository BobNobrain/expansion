package config

import (
	"fmt"
	"os"
)

type dbConfig struct {
	Host     string
	Port     string
	Database string
	User     string
	Password string
}

type SrvConfig struct {
	Port                string
	StaticFilesLocation string

	WorldSeed string

	AssetDir string

	DB dbConfig

	AuthJWTSecret string
}

type unknownEnvError struct {
	env string
}

func (e *unknownEnvError) Error() string {
	return fmt.Sprintf("unknown env value '%s'", e.env)
}

func Get() (*SrvConfig, error) {
	env := os.Getenv("EXPANSION_ENV")

	switch env {
	case "prod":
		panic("no production config is here yet")

	case "dev":
	case "":
		return getDevConfig(), nil
	}

	return nil, &unknownEnvError{}
}
