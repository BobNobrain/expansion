package editorapiimpl

import (
	"net/http"
	"os"
	"srv/internal/editor/editortreecache"
	"srv/internal/utils/common"
)

type createDirHandler struct {
	fileTree editortreecache.EditorTreeCache
}

func (h *createDirHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// CREATE dir
	name := getAssetFileName(w, r, assetFileNameOptions{shouldNotExist: true})
	if name == "" {
		return
	}

	err := os.MkdirAll(name, os.ModeDir)
	if err != nil {
		respondError(w, 500, common.NewUnknownError(err))
		return
	}

	respondEmpty(w)
	h.fileTree.Invalidate()
}
