package config

import (
	"os"
	"path/filepath"
)

func getDevConfig() *SrvConfig {
	statics := os.Getenv("SRV_STATIC")
	if statics == "" {
		statics = "../ui/dist"
	}

	return &SrvConfig{
		Port:                "8031",
		StaticFilesLocation: statics,

		WorldSeed: "deadmouse",

		AssetDir: filepath.Join("..", "assets"),

		DB: dbConfig{
			Host:     "localhost",
			Port:     "5012",
			Database: "expansion",
			User:     "devsrv",
			Password: "dev",
		},

		AuthJWTSecret: "[REDACTED]",
	}
}
