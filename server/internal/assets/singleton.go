package assets

import (
	"fmt"
	"os"
)

var loader *AssetLoader = nil

type badAssetDirectoryError struct {
	dirname string
}

func (e *badAssetDirectoryError) Error() string {
	return fmt.Sprintf("bad asset directory '%s'", e.dirname)
}

func Configure(dirname string) (*AssetLoader, error) {
	stat, err := os.Stat(dirname)

	if err != nil {
		return nil, err
	}

	if !stat.IsDir() {
		return nil, &badAssetDirectoryError{dirname: dirname}
	}

	loader = &AssetLoader{
		assetDirectory: dirname,
	}

	return loader, nil
}

type assetLoaderNotConfiguredError struct{}

func (e *assetLoaderNotConfiguredError) Error() string {
	return "asset loader has not been configured"
}

func GetAssetLoader() *AssetLoader {
	if loader == nil {
		panic(&assetLoaderNotConfiguredError{})
	}

	return loader
}
