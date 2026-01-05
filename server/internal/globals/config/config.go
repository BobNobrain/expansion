package config

import "time"

type DBConfig struct {
	Host     string
	Port     string
	Database string
	User     string
	Password string
}

type CNRConfig struct {
	MaxSuggestionsPerUser int
}

type WorldConfig struct {
	Seed           string
	AutoSavePeriod time.Duration
	AllowCheats    bool
}

type HTTPConfig struct {
	Port                string
	StaticFilesLocation string
	GameUrlPrefix       string
	SocketPath          string
	ApiPath             string
}

type AuthConfig struct {
	JWTSecret string
}

type AssetsConfig struct {
	AssetDir string
}

type SrvConfig struct {
	Assets AssetsConfig
	Auth   AuthConfig
	CNR    CNRConfig
	DB     DBConfig
	HTTP   HTTPConfig
	World  WorldConfig
}
