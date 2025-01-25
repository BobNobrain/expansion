package domain

import (
	"srv/internal/utils/locale"
	"time"
)

type NamesRegistryEntryID int

type NamesRegistryEntryStatus byte

const (
	NamesRegistryEntryStatusUnknown NamesRegistryEntryStatus = iota
	NamesRegistryEntryStatusSuggested
	NamesRegistryEntryStatusApproved
	NamesRegistryEntryStatusDeclined
)

type NamesRegistryEntryShort struct {
	ObjectID string
	Name     string
	NamedBy  UserID
	NamedAt  time.Time
}

type NamesRegistryEntry struct {
	EntryID  NamesRegistryEntryID
	ObjectID string

	Name string

	NamedBy UserID
	NamedAt time.Time

	Status        NamesRegistryEntryStatus
	ReviewedBy    UserID
	ReviewedAt    time.Time
	ReviewComment string
}

type NamesRegistryCurrentNamesLocalized map[locale.Locale]*NamesRegistryEntry
