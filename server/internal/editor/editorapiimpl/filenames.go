package editorapiimpl

import (
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"srv/internal/globals/config"
	"srv/internal/utils/common"
	"strings"
)

type assetFileNameOptions struct {
	shouldExist       bool
	shouldNotExist    bool
	shouldBeFile      bool
	shouldBeDirectory bool
	paramName         string
}

func getAssetFileName(w http.ResponseWriter, r *http.Request, v assetFileNameOptions) string {
	paramName := v.paramName
	if paramName == "" {
		paramName = "path"
	}
	path := r.URL.Query().Get(paramName)
	if path == "" {
		respondError(w, 400, common.NewValidationError(paramName, "query parameter is required"))
		return ""
	}
	path = filepath.Clean(path)
	if path == "" || strings.Contains(path, "..") {
		respondError(w, 400, common.NewValidationError(paramName, "invalid value for query parameter"))
	}
	if path[0] == '/' {
		path = path[1:]
	}

	path = filepath.Join(config.Assets().AssetDir, path)

	stat, err := os.Stat(path)
	exists := true
	if err != nil && errors.Is(err, os.ErrNotExist) {
		exists = false
	}
	isDir := false
	if exists {
		isDir = stat.IsDir()
	}

	details := common.NewDictEncodable().Set("path", path)

	if v.shouldExist && !exists {
		respondError(w, 404, common.NewValidationError(paramName, "file does not exist", common.WithDetails(details)))
		return ""
	}
	if v.shouldNotExist && exists {
		respondError(w, 400, common.NewValidationError(paramName, "file already exists", common.WithDetails(details)))
		return ""
	}
	if v.shouldBeFile && (isDir || !exists) {
		respondError(w, 400, common.NewValidationError(paramName, "file is a directory", common.WithDetails(details)))
		return ""
	}
	if v.shouldBeDirectory && (!isDir || !exists) {
		respondError(w, 400, common.NewValidationError(paramName, "file is not a directory", common.WithDetails(details)))
		return ""
	}

	return path
}
