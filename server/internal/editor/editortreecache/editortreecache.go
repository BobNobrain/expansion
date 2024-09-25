package editortreecache

import (
	"os"
	"path/filepath"
	"srv/internal/globals/config"
	"srv/pkg/editorapi"
	"sync"
	"time"
)

type EditorTreeCache interface {
	Invalidate()
	Reload() error
	GetTree() *editorapi.FileTree
}

type editorFileTreeAccessor struct {
	lock *sync.Mutex

	lastLoaded time.Time
	tree       *editorapi.FileTree
}

func New() EditorTreeCache {
	return &editorFileTreeAccessor{
		lock: new(sync.Mutex),
		tree: &editorapi.FileTree{
			Root: editorapi.FileTreeEntry{
				Name:     "",
				Children: make([]editorapi.FileTreeEntry, 0),
				IsDir:    true,
			},
			Total: 0,
		},
	}
}

func (e *editorFileTreeAccessor) Reload() error {
	e.lock.Lock()
	defer e.lock.Unlock()

	startTime := time.Now()
	e.tree.Root.Children = make([]editorapi.FileTreeEntry, 0)
	total, err := recursiveLoad(config.Assets().AssetDir, &e.tree.Root)
	if err != nil {
		return err
	}

	e.lastLoaded = startTime
	e.tree.Total = total
	return nil
}

func recursiveLoad(path string, into *editorapi.FileTreeEntry) (int, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return 0, err
	}

	var total int
	for _, entry := range entries {
		isDir := entry.IsDir()
		isFile := entry.Type().IsRegular()

		if !isDir && !isFile {
			continue
		}

		filename := entry.Name()
		if filename[0] == '.' || (isFile && filepath.Ext(filename) != ".json") {
			// skip hidden and non-json files
			continue
		}

		fullPath := filepath.Join(path, entry.Name())
		value := editorapi.FileTreeEntry{
			Name:     entry.Name(),
			Children: make([]editorapi.FileTreeEntry, 0),
			IsDir:    isDir,
		}

		if isDir {
			n, subError := recursiveLoad(fullPath, &value)
			if subError != nil {
				return total, subError
			}
			total += n
		} else if isFile {
			total += 1
		}

		into.Children = append(into.Children, value)
	}

	return total, nil
}

func (e *editorFileTreeAccessor) GetTree() *editorapi.FileTree {
	e.lock.Lock()
	defer e.lock.Unlock()

	return e.tree
}

func (e *editorFileTreeAccessor) Invalidate() {
	go e.Reload()
}
