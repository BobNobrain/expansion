package editorapiimpl

import (
	"net/http"
	"srv/internal/editor/editortreecache"
	"srv/internal/utils/common"
)

type getTreeHandler struct {
	fileTree editortreecache.EditorTreeCache
}

func (g *getTreeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	tree := g.fileTree.GetTree()
	if tree == nil {
		respondError(w, 500, common.NewError(common.WithMessage("tree is nil")))
		return
	}

	respondJson(w, 200, tree)
}
