package cnr

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
	"sync"
)

type celestialNamesRegistry struct {
	lock *sync.RWMutex

	storage           components.NamesRegistry
	currentNamesCache map[string]domain.NamesRegistryCurrentNamesLocalized
}

// Wraps an existing NamesRegistry to keep an in-memory cache of all actual names
// to speed up `.GetCurrentName(s)Of` methods.
// Needs to be `.Populate()`d first.
func NewCachedNamesRegistry(storage components.NamesRegistry) components.NamesRegistry {
	return &celestialNamesRegistry{
		lock:              &sync.RWMutex{},
		storage:           storage,
		currentNamesCache: make(map[string]domain.NamesRegistryCurrentNamesLocalized),
	}
}

func (cache *celestialNamesRegistry) Populate() common.Error {
	cache.lock.Lock()
	defer cache.lock.Unlock()

	result, err := cache.storage.Query(
		components.NamesRegistryQuery{
			Statuses: []domain.NamesRegistryEntryStatus{domain.NamesRegistryEntryStatusApproved},
		},
		// we need to load all the entries
		pagination.PageParams{Offset: 0, Limit: 0},
	)
	if err != nil {
		return err
	}

	for _, entry := range result.Items {
		oid := entry.ObjectID
		locale := entry.Locale

		objectNames := cache.currentNamesCache[oid]
		if objectNames == nil {
			objectNames = make(domain.NamesRegistryCurrentNamesLocalized)
			cache.currentNamesCache[oid] = objectNames
		}

		objectNames[locale] = &entry
	}

	return nil
}

func (cache *celestialNamesRegistry) GetCurrentNamesOf(
	objectIDs []string,
) (map[string]domain.NamesRegistryCurrentNamesLocalized, common.Error) {
	cache.lock.RLock()
	defer cache.lock.RUnlock()

	result := make(map[string]domain.NamesRegistryCurrentNamesLocalized)

	for _, oid := range objectIDs {
		result[oid] = cache.currentNamesCache[oid]
	}

	return result, nil
}

func (cache *celestialNamesRegistry) GetCurrentNameOf(
	objectID string,
) (domain.NamesRegistryCurrentNamesLocalized, common.Error) {
	cache.lock.RLock()
	defer cache.lock.RUnlock()

	return cache.currentNamesCache[objectID], nil
}

// proxy the methods to underlaying slower layer and update the cache

func (cache *celestialNamesRegistry) Query(
	q components.NamesRegistryQuery,
	page pagination.PageParams,
) (pagination.Page[domain.NamesRegistryEntry], common.Error) {
	return cache.storage.Query(q, page)
}

func (cache *celestialNamesRegistry) SuggestName(rq components.NamesRegistrySuggestion) common.Error {
	// cache is not altered, because we only cache approved names, not suggestions
	return cache.storage.SuggestName(rq)
}

func (cache *celestialNamesRegistry) Review(
	review components.NamesRegistryReview,
) (domain.NamesRegistryEntry, common.Error) {
	cache.lock.Lock()
	defer cache.lock.Unlock()

	entry, err := cache.storage.Review(review)
	if err != nil {
		return entry, err
	}

	if review.ShouldApprove {
		// new name approved, add it to the cache
		namesByLoc := cache.currentNamesCache[entry.ObjectID]
		if namesByLoc == nil {
			namesByLoc = make(domain.NamesRegistryCurrentNamesLocalized)
			cache.currentNamesCache[entry.ObjectID] = namesByLoc
		}
		namesByLoc[entry.Locale] = &entry
	} else {
		// a name got rejected, there is a possibility it has been approved already
		namesByLoc := cache.currentNamesCache[entry.ObjectID]
		if namesByLoc != nil {
			delete(namesByLoc, entry.Locale)
		}
	}

	return entry, nil
}
