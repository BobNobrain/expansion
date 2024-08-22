package editorapiimpl

import (
	"errors"
	"net/http"
	"srv/internal/editor/editortreecache"
)

type EditorHttpApi interface {
	Start(addr string) error
	Stop() error
}

type editorHttpApi struct {
	server   *http.Server
	fileTree editortreecache.EditorTreeCache
}

func New(fileTree editortreecache.EditorTreeCache) EditorHttpApi {
	mux := http.DefaultServeMux
	api := &editorHttpApi{
		server: &http.Server{
			Handler: mux,
		},
		fileTree: fileTree,
	}

	proxy := newProxyHandler()

	mux.Handle("GET /api/tree", &getTreeHandler{fileTree: fileTree})
	mux.Handle("POST /api/tree", &createDirHandler{fileTree: fileTree})
	mux.Handle("PUT /api/tree", &moveHandler{fileTree: fileTree})

	mux.Handle("GET /api/file", &getFileHandler{})
	mux.Handle("POST /api/file", &createFileHandler{fileTree: fileTree})
	mux.Handle("PUT /api/file", &updateFileHandler{fileTree: fileTree})
	mux.Handle("DELETE /api/file", &deleteFileHandler{fileTree: fileTree})

	mux.Handle("GET /", proxy)

	return api
}

func (api *editorHttpApi) Start(addr string) error {
	api.server.Addr = addr
	err := api.server.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func (api *editorHttpApi) Stop() error {
	return api.server.Close()
}
