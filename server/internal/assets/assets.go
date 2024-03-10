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
