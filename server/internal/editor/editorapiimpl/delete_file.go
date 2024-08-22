package editorapiimpl

import (
	"net/http"
	"os"
	"srv/internal/editor/editortreecache"
	"srv/internal/utils/common"
)

type deleteFileHandler struct {
	fileTree editortreecache.EditorTreeCache
}

func (h *deleteFileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// DELETE file
	name := getAssetFileName(w, r, assetFileNameOptions{shouldExist: true, shouldBeFile: true})
	if name == "" {
		return
	}

	err := os.Remove(name)
	if err != nil {
		respondError(w, 500, common.NewUnknownError(err))
		return
	}

	respondEmpty(w)
	h.fileTree.Invalidate()
}
