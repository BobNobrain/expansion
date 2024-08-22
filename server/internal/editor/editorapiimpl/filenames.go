package editorapiimpl

import (
	"errors"
	"fmt"
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
		respondError(w, 400, common.NewError("ERR_BAD_REQUEST", fmt.Sprintf("query parameter '%s' is required", paramName)))
		return ""
	}
	path = filepath.Clean(path)
	if path == "" || strings.Contains(path, "..") {
		respondError(w, 400, common.NewError("ERR_BAD_REQUEST", fmt.Sprintf("bad value for '%s' query parameter", paramName)))
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

	details := common.DictEncodable().Set("path", path)

	if v.shouldExist && !exists {
		respondError(w, 404, common.NewErrorWithDetails("ERR_BAD_REQUEST", "file does not exist", details))
		return ""
	}
	if v.shouldNotExist && exists {
		respondError(w, 400, common.NewErrorWithDetails("ERR_BAD_REQUEST", "file already exists", details))
		return ""
	}
	if v.shouldBeFile && (isDir || !exists) {
		respondError(w, 400, common.NewErrorWithDetails("ERR_BAD_REQUEST", "file is a directory", details))
		return ""
	}
	if v.shouldBeDirectory && (!isDir || !exists) {
		respondError(w, 400, common.NewErrorWithDetails("ERR_BAD_REQUEST", "file is not a directory", details))
		return ""
	}

	return path
}
