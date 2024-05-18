package domain

import (
	"srv/internal/utils/locale"
	"time"
)

type NamesRegistryEntryID int

type NamesRegistryEntryStatus byte

const (
	NamesRegistryEntryStatusSuggested NamesRegistryEntryStatus = iota
	NamesRegistryEntryStatusApproved  NamesRegistryEntryStatus = iota
	NamesRegistryEntryStatusRejected  NamesRegistryEntryStatus = iota
)

type NamesRegistryEntry struct {
	EntryID  NamesRegistryEntryID
	ObjectID string

	Name   string
	Locale locale.Locale

	NamedBy UserID
	NamedAt time.Time

	Status        NamesRegistryEntryStatus
	ReviewedBy    UserID
	ReviewedAt    time.Time
	ReviewComment string
}

type NamesRegistryCurrentNamesLocalized map[locale.Locale]*NamesRegistryEntry
