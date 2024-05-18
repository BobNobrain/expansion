package pagination

type PageParams struct {
	Limit  int
	Offset int
}

func (p PageParams) Normalized(defaultLimit int, maxLimit int) PageParams {
	result := PageParams{Limit: p.Limit, Offset: p.Offset}
	if result.Offset < 0 {
		result.Offset = 0
	}
	if result.Limit <= 0 {
		result.Limit = defaultLimit
	}
	if result.Limit > maxLimit {
		result.Limit = maxLimit
	}
	return result
}

type PageInfo struct {
	Offset int
	Total  int
}

type Page[Item any] struct {
	Items []Item
	Page  PageInfo
}

func EmptyPage[T any]() Page[T] {
	return Page[T]{
		Items: nil,
		Page:  PageInfo{Offset: 0, Total: 0},
	}
}

func GetPage[T any](all []T, params PageParams) Page[T] {
	total := len(all)

	offset := params.Offset
	if offset < 0 {
		offset = 0
	}
	if offset >= total {
		return Page[T]{
			Items: nil,
			Page:  PageInfo{Offset: offset, Total: total},
		}
	}

	limit := params.Limit
	if limit <= 0 {
		limit = 100
	}
	if offset+limit > total {
		limit = total - offset
	}

	return Page[T]{
		Items: all[offset : offset+limit],
		Page:  PageInfo{Offset: offset, Total: total},
	}
}
