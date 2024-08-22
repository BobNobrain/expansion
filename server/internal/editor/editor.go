package editor

import (
	"srv/internal/editor/editorapiimpl"
	"srv/internal/editor/editortreecache"
	"srv/internal/globals"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
)

type EditorAPI struct {
	fileTree editortreecache.EditorTreeCache
	api      editorapiimpl.EditorHttpApi
}

func New() *EditorAPI {
	tree := editortreecache.New()
	api := editorapiimpl.New(tree)
	return &EditorAPI{
		fileTree: tree,
		api:      api,
	}
}

func (e *EditorAPI) Start() error {
	globals.Init()

	err := e.fileTree.Reload()
	if err != nil {
		return err
	}

	logger.Info(logger.FromMessage("editor", "Starting editor API at http://localhost:8013"))

	err = e.api.Start(":8013")
	if err != nil {
		return err
	}

	return nil
}

func (e *EditorAPI) Stop() {
	err := e.api.Stop()
	if err != nil {
		logger.Error(logger.FromError("editor", common.NewUnknownError(err)))
	}
}
