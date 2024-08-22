package editorapi

type FileTree struct {
	Total int           `json:"total"`
	Root  FileTreeEntry `json:"root"`
}

type FileTreeEntry struct {
	Name     string          `json:"name"`
	Children []FileTreeEntry `json:"children"`
	IsDir    bool            `json:"isDir"`
}
