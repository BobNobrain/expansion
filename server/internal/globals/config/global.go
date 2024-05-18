package config

import (
	"fmt"
	"os"
)

var globalConfig *SrvConfig

func Init() {
	env := os.Getenv("EXPANSION_ENV")

	switch env {
	case "prod":
		panic("no production config is here yet")

	case "dev":
	case "":
		globalConfig = getDevConfig()

	default:
		panic(fmt.Sprintf("unknown env value '%s'", env))
	}

}

func Get() *SrvConfig {
	return globalConfig
}

func Assets() *AssetsConfig {
	return &globalConfig.Assets
}
func Auth() *AuthConfig {
	return &globalConfig.Auth
}
func CNR() *CNRConfig {
	return &globalConfig.CNR
}
func DB() *DBConfig {
	return &globalConfig.DB
}
func HTTP() *HTTPConfig {
	return &globalConfig.HTTP
}
func World() *WorldConfig {
	return &globalConfig.World
}
