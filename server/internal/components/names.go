package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
)

type NamesRegistrySuggestion struct {
	ObjectID string
	Author   domain.UserID
	Name     string
}

type NamesRegistryReview struct {
	EntryID       domain.NamesRegistryEntryID
	Author        domain.UserID
	ShouldApprove bool
	Comment       string
}

type NamesRegistry interface {
	SuggestName(rq NamesRegistrySuggestion) common.Error
	Review(review NamesRegistryReview) common.Error

	GetCurrentNameOf(string) (domain.NamesRegistryEntryShort, common.Error)
	GetCurrentNamesOf([]string) (map[string]domain.NamesRegistryEntryShort, common.Error)

	GetEntriesByAuthor(domain.UserID, pagination.PageParams) (pagination.Page[domain.NamesRegistryEntry], common.Error)
	GetSuggestionsBacklog(pagination.PageParams) (pagination.Page[domain.NamesRegistryEntry], common.Error)
}
