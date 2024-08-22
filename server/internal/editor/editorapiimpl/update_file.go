package editorapiimpl

import (
	"io"
	"net/http"
	"os"
	"srv/internal/editor/editortreecache"
	"srv/internal/utils/common"
)

type updateFileHandler struct {
	fileTree editortreecache.EditorTreeCache
}

func (h *updateFileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// UPDATE file
	name := getAssetFileName(w, r, assetFileNameOptions{shouldExist: true, shouldBeFile: true})
	if name == "" {
		return
	}

	file, err := os.Create(name)
	if err != nil {
		respondError(w, 500, common.NewUnknownError(err))
		return
	}

	_, err = io.Copy(file, r.Body)
	if err != nil {
		respondError(w, 500, common.NewUnknownError(err))
		return
	}

	respondEmpty(w)
	h.fileTree.Invalidate()
}
