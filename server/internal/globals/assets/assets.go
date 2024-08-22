package assets

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type AssetLoader struct {
	assetDirectory string
}

func (*AssetLoader) assetName(parts ...string) string {
	return filepath.Join(parts...)
}

func (l *AssetLoader) loadDirectoryAssets(name string) ([]string, error) {
	files, err := os.ReadDir(filepath.Join(l.assetDirectory, name))
	if err != nil {
		return nil, err
	}

	result := make([]string, 0)
	for _, file := range files {
		if file.Type().IsDir() || !file.Type().IsRegular() {
			continue
		}

		result = append(result, filepath.Join(name, file.Name()))
	}
	return result, nil
}

func (l *AssetLoader) loadJSONAsset(name string, into interface{}) error {
	bytes, err := os.ReadFile(filepath.Join(l.assetDirectory, name))

	if err != nil {
		return err
	}

	return json.Unmarshal(bytes, into)
}

func (l *AssetLoader) saveJSONAsset(name string, value interface{}) error {
	bytes, err := json.Marshal(value)

	if err != nil {
		return err
	}

	return os.WriteFile(filepath.Join(l.assetDirectory, name), bytes, 0644)
}
