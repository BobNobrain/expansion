package config

import (
	"os"
	"path/filepath"
	"time"
)

func getDevConfig() *SrvConfig {
	statics := os.Getenv("SRV_STATIC")
	if statics == "" {
		statics = "../ui/dist"
	}

	return &SrvConfig{
		Assets: AssetsConfig{
			AssetDir: filepath.Join("..", "assets"),
		},

		Auth: AuthConfig{
			JWTSecret: "[REDACTED]",
		},

		CNR: CNRConfig{
			MaxSuggestionsPerUser: 5,
		},

		DB: DBConfig{
			Host:     "localhost",
			Port:     "5012",
			Database: "expansion",
			User:     "devsrv",
			Password: "dev",
		},

		HTTP: HTTPConfig{
			Port:                "8031",
			StaticFilesLocation: statics,
		},

		World: WorldConfig{
			Seed:           "deadmouse",
			AutoSavePeriod: time.Minute * 3,
			AllowCheats:    true,
		},
	}
}
