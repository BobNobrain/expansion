package editorapiimpl

import (
	"net/http"
	"os"
	"srv/internal/editor/editortreecache"
	"srv/internal/utils/common"
)

type moveHandler struct {
	fileTree editortreecache.EditorTreeCache
}

func (h *moveHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// MOVE file/dir
	oldName := getAssetFileName(w, r, assetFileNameOptions{shouldExist: true})
	if oldName == "" {
		return
	}
	newName := getAssetFileName(w, r, assetFileNameOptions{shouldNotExist: true})
	if newName == "" {
		return
	}

	err := os.Rename(oldName, newName)
	if err != nil {
		respondError(w, 500, common.NewUnknownError(err))
		return
	}

	respondEmpty(w)
	h.fileTree.Invalidate()
}
