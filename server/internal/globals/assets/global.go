package assets

import (
	"fmt"
	"os"
	"srv/internal/globals/config"
)

var globalLoader *AssetLoader = nil

func Init() {
	dirname := config.Assets().AssetDir
	stat, err := os.Stat(dirname)

	if err != nil {
		panic(err)
	}

	if !stat.IsDir() {
		panic(fmt.Sprintf("bad asset directory '%s'", dirname))
	}

	globalLoader = &AssetLoader{
		assetDirectory: dirname,
	}
}
