package domain

type PageParams struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

type PageInfo struct {
	Offset int32 `json:"offset"`
	Total  int32 `json:"total"`
}
