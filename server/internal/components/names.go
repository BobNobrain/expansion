package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/locale"
	"srv/internal/utils/pagination"
)

type NamesRegistryQuery struct {
	ObjectID   string
	Statuses   []domain.NamesRegistryEntryStatus
	Locales    []locale.Locale
	NamedBy    domain.UserID
	ReviewedBy domain.UserID

	OrderByNamedTime    bool
	OrderByReviewedTime bool
}

type NamesRegistrySuggestion struct {
	ObjectID string
	Author   domain.UserID
	Name     string
	Locale   locale.Locale
}

type NamesRegistryReview struct {
	EntryID       domain.NamesRegistryEntryID
	Author        domain.UserID
	ShouldApprove bool
	Comment       string
}

type NamesRegistry interface {
	Query(q NamesRegistryQuery, page pagination.PageParams) (pagination.Page[domain.NamesRegistryEntry], common.Error)

	SuggestName(rq NamesRegistrySuggestion) common.Error
	Review(review NamesRegistryReview) (domain.NamesRegistryEntry, common.Error)

	GetCurrentNameOf(string) (domain.NamesRegistryCurrentNamesLocalized, common.Error)
	GetCurrentNamesOf([]string) (map[string]domain.NamesRegistryCurrentNamesLocalized, common.Error)
}
