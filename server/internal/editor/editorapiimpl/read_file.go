package editorapiimpl

import "net/http"

type getFileHandler struct{}

func (h *getFileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// READ file
	name := getAssetFileName(w, r, assetFileNameOptions{shouldExist: true, shouldBeFile: true})
	if name == "" {
		return
	}

	http.ServeFile(w, r, name)
}
