package db

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/db/dbcore"
	"srv/internal/domain"
	"srv/internal/globals/config"
	"srv/internal/utils/common"
	"srv/internal/utils/locale"
	"srv/internal/utils/pagination"
	"time"

	"github.com/huandu/go-sqlbuilder"
)

type namesRegistryImpl struct {
	db      *dbcore.Conn
	entries *dbcore.Table
}

func newNamesRegistry(db *dbcore.Conn) *namesRegistryImpl {
	return &namesRegistryImpl{
		db:      db,
		entries: dbcore.MakeTable("cnr_entries"),
	}
}

const (
	cnrEntryFieldID         = "entry_id"
	cnrEntryFieldObjectID   = "object_id"
	cnrEntryFieldName       = "name"
	cnrEntryFieldLocale     = "locale"
	cnrEntryFieldNamedBy    = "named_by"
	cnrEntryFieldNamedAt    = "named_at"
	cnrEntryFieldStatus     = "status"
	cnrEntryFieldReviewedBy = "reviewed_by"
	cnrEntryFieldReviewedAt = "reviewed_at"
	cnrEntryFieldComment    = "review_comment"
)

type dbCNREntry struct {
	EntryID  int    `db:"entry_id"`
	ObjectID string `db:"object_id"`

	Name   string `db:"name"`
	Locale string `db:"locale"`

	NamedBy string    `db:"named_by"`
	NamedAt time.Time `db:"named_at"`

	Status     byte       `db:"status"`
	ReviewedBy *string    `db:"reviewed_by"`
	ReviewedAt *time.Time `db:"reviewed_at"`

	Comment string `db:"review_comment"`
}

func (entry *dbCNREntry) toNamesRegistryEntry() domain.NamesRegistryEntry {
	reviewer := domain.UserID("")
	if entry.ReviewedBy != nil {
		reviewer = domain.UserID(*entry.ReviewedBy)
	}
	reviewTime := time.Time{}
	if entry.ReviewedAt != nil {
		reviewTime = *entry.ReviewedAt
	}

	return domain.NamesRegistryEntry{
		EntryID:  domain.NamesRegistryEntryID(entry.EntryID),
		ObjectID: entry.ObjectID,
		Name:     entry.Name,
		Locale:   locale.Parse(entry.Locale),

		NamedBy: domain.UserID(entry.NamedBy),
		NamedAt: entry.NamedAt,

		Status:        domain.NamesRegistryEntryStatus(entry.Status),
		ReviewedBy:    reviewer,
		ReviewedAt:    reviewTime,
		ReviewComment: entry.Comment,
	}
}

type dbCNREntryInsert struct {
	ObjectID string `db:"object_id"`
	Name     string `db:"name"`
	Locale   string `db:"locale"`
	NamedBy  string `db:"named_by"`
}

func (repo *namesRegistryImpl) getCNREntriesSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	entries := repo.entries.CreateTableBuilder()
	entries.Define(cnrEntryFieldID, "SERIAL", "PRIMARY KEY", "NOT NULL")

	entries.Define(cnrEntryFieldObjectID, "TEXT", "NOT NULL")
	entries.Define(cnrEntryFieldName, "TEXT", "NOT NULL")
	entries.Define(cnrEntryFieldLocale, "VARCHAR(10)", "NOT NULL")

	entries.Define(cnrEntryFieldNamedBy, "UUID", "NOT NULL")
	entries.Define(cnrEntryFieldNamedAt, "TIMESTAMPTZ", "NOT NULL", "DEFAULT NOW()")

	entries.Define(cnrEntryFieldStatus, "SMALLINT", fmt.Sprintf("DEFAULT %d", domain.NamesRegistryEntryStatusSuggested))
	entries.Define(cnrEntryFieldReviewedBy, "UUID")
	entries.Define(cnrEntryFieldReviewedAt, "TIMESTAMPTZ", "DEFAULT NULL")

	return entries
}

func (repo *namesRegistryImpl) getById(id domain.NamesRegistryEntryID) (*domain.NamesRegistryEntry, common.Error) {
	builder := repo.entries.SelectBuilder("*")
	builder.Where(builder.Equal(cnrEntryFieldID, id))

	var rows []dbCNREntry
	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) < 1 {
		return nil, nil
	}

	entry := rows[0].toNamesRegistryEntry()
	return &entry, nil
}

func (repo *namesRegistryImpl) Query(
	q components.NamesRegistryQuery,
	page pagination.PageParams,
) (pagination.Page[domain.NamesRegistryEntry], common.Error) {
	builder := repo.entries.SelectBuilder("*")

	applyNamesRegistryQuery(builder, q)
	if page.Offset >= 0 {
		builder.Offset(page.Offset)
	}
	if page.Limit > 0 {
		builder.Limit(page.Limit)
	}

	var rows []dbCNREntry
	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return pagination.EmptyPage[domain.NamesRegistryEntry](), err
	}

	items := make([]domain.NamesRegistryEntry, len(rows))
	for i, row := range rows {
		items[i] = row.toNamesRegistryEntry()
	}

	var total int
	if page.Limit > 0 {
		totalBuilder := repo.entries.SelectBuilder("COUNT(*)")
		applyNamesRegistryQuery(totalBuilder, q)
		err = repo.db.RunQuery(totalBuilder, &total)
		if err != nil {
			return pagination.EmptyPage[domain.NamesRegistryEntry](), err
		}
	}

	return pagination.Page[domain.NamesRegistryEntry]{
		Items: items,
		Page:  pagination.PageInfo{Offset: page.Offset, Total: total},
	}, nil
}

func applyNamesRegistryQuery(builder *sqlbuilder.SelectBuilder, q components.NamesRegistryQuery) {
	if q.ObjectID != "" {
		builder.Where(builder.Equal(cnrEntryFieldObjectID, q.ObjectID))
	}

	if q.NamedBy != "" {
		builder.Where(builder.Equal(cnrEntryFieldNamedBy, q.NamedBy))
	}

	if q.ReviewedBy != "" {
		builder.Where(builder.Equal(cnrEntryFieldReviewedBy, q.ReviewedBy))
	}

	if len(q.Locales) > 0 {
		conditions := make([]string, len(q.Locales))
		for i, loc := range q.Locales {
			conditions[i] = builder.Equal(cnrEntryFieldLocale, loc)
		}
		builder.Where(builder.Or(conditions...))
	}

	if len(q.Statuses) > 0 {
		conditions := make([]string, len(q.Statuses))
		for i, status := range q.Statuses {
			conditions[i] = builder.Equal(cnrEntryFieldStatus, status)
		}
		builder.Where(builder.Or(conditions...))
	}

	if q.OrderByNamedTime || q.OrderByReviewedTime {
		orders := make([]string, 0)
		if q.OrderByNamedTime {
			orders = append(orders, fmt.Sprintf("%s DESC", cnrEntryFieldNamedAt))
		}
		if q.OrderByReviewedTime {
			orders = append(orders, fmt.Sprintf("%s DESC", cnrEntryFieldReviewedAt))
		}

		builder.OrderBy(orders...)
	}
}

func (repo *namesRegistryImpl) SuggestName(rq components.NamesRegistrySuggestion) common.Error {
	tx, err := repo.db.StartTransaction()
	defer tx.Finish()

	if err != nil {
		return err
	}

	alreadyHasName, err := repo.hasNameOrSuggestionFor(tx, rq.ObjectID, rq.Locale)
	if err != nil {
		return err
	}
	if alreadyHasName {
		return common.NewErrorWithDetails(
			"ERR_CNR_EXISTS",
			"already has a name or suggestion",
			common.DictEncodable().
				Set("objectId", rq.ObjectID).
				Set("loc", rq.Locale),
		)
	}

	userHasReachedLimit, err := repo.hasReachedSuggestionsLimit(tx, rq.Author)
	if err != nil {
		return err
	}
	if userHasReachedLimit {
		return common.NewErrorWithDetails(
			"ERR_CNR_LIMIT",
			"you have reached the suggestion limit",
			common.DictEncodable().
				Set("limit", config.CNR().MaxSuggestionsPerUser).
				Set("user", rq.Author),
		)
	}

	builder := repo.entries.InsertBuilderFromSingleValue(dbCNREntryInsert{
		ObjectID: rq.ObjectID,
		Name:     rq.Name,
		Locale:   string(rq.Locale),
		NamedBy:  string(rq.Author),
	})
	err = repo.db.RunStatement(builder)
	if err != nil {
		return err
	}

	tx.Succeeded()
	return nil
}

func (repo *namesRegistryImpl) Review(review components.NamesRegistryReview) (domain.NamesRegistryEntry, common.Error) {
	builder := repo.entries.UpdateBuilder()

	status := domain.NamesRegistryEntryStatusRejected
	if review.ShouldApprove {
		status = domain.NamesRegistryEntryStatusApproved
	}

	builder.Set(builder.Assign(cnrEntryFieldStatus, status))
	builder.Set(builder.Assign(cnrEntryFieldReviewedBy, review.Author))
	builder.Set(builder.Assign(cnrEntryFieldComment, review.Comment))
	builder.Set(fmt.Sprintf("%s = NOW()", cnrEntryFieldReviewedAt))

	builder.Where(builder.Equal(cnrEntryFieldID, review.EntryID))

	err := repo.db.RunStatement(builder)
	if err != nil {
		return domain.NamesRegistryEntry{}, err
	}

	updatedEntry, err := repo.getById(review.EntryID)
	if err != nil {
		return domain.NamesRegistryEntry{}, err
	}

	if updatedEntry == nil {
		// i wonder how did that happen
		return domain.NamesRegistryEntry{}, makeNotFoundError(
			fmt.Sprintf("entry with id %d was not found", review.EntryID),
		)
	}

	return *updatedEntry, nil
}

func (repo *namesRegistryImpl) GetCurrentNameOf(
	objectID string,
) (domain.NamesRegistryCurrentNamesLocalized, common.Error) {
	builder := repo.entries.SelectBuilder("*")
	builder.Where(builder.Equal(cnrEntryFieldObjectID, objectID))
	builder.Where(builder.Equal(cnrEntryFieldStatus, domain.NamesRegistryEntryStatusApproved))
	builder.OrderBy(cnrEntryFieldNamedAt).Desc()

	var rows []dbCNREntry
	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return nil, err
	}

	result := make(domain.NamesRegistryCurrentNamesLocalized)
	for _, row := range rows {
		entry := row.toNamesRegistryEntry()
		result[locale.Parse(row.Locale)] = &entry
	}

	return result, nil
}

func (repo *namesRegistryImpl) GetCurrentNamesOf(
	objectIDs []string,
) (map[string]domain.NamesRegistryCurrentNamesLocalized, common.Error) {
	builder := repo.entries.SelectBuilder("*")

	oids := make([]interface{}, len(objectIDs))
	for i, id := range objectIDs {
		oids[i] = id
	}

	builder.Where(builder.In(cnrEntryFieldObjectID, oids...))
	builder.Where(builder.Equal(cnrEntryFieldStatus, domain.NamesRegistryEntryStatusApproved))

	var rows []dbCNREntry
	err := repo.db.RunQuery(builder, &rows)
	if err != nil {
		return nil, err
	}

	result := make(map[string]domain.NamesRegistryCurrentNamesLocalized)
	for _, row := range rows {
		entry := row.toNamesRegistryEntry()
		loc := entry.Locale
		oid := entry.ObjectID

		byLocale := result[oid]
		if byLocale == nil {
			byLocale = make(domain.NamesRegistryCurrentNamesLocalized)
			result[oid] = byLocale
		}

		byLocale[loc] = &entry
	}

	return result, nil
}

func (repo *namesRegistryImpl) hasNameOrSuggestionFor(
	tx *dbcore.Tx,
	objectID string,
	loc locale.Locale,
) (bool, common.Error) {
	builder := repo.entries.SelectBuilder("COUNT(*)")
	builder.Where(builder.Equal(cnrEntryFieldObjectID, objectID))
	builder.Where(builder.Equal(cnrEntryFieldLocale, loc))
	builder.Where(
		builder.Or(
			builder.Equal(cnrEntryFieldStatus, domain.NamesRegistryEntryStatusSuggested),
			builder.Equal(cnrEntryFieldStatus, domain.NamesRegistryEntryStatusApproved),
		),
	)
	builder.Limit(1)

	var result int
	err := tx.RunQuery(builder, &result)
	if err != nil {
		return false, err
	}

	return result > 0, nil
}

func (repo *namesRegistryImpl) hasReachedSuggestionsLimit(
	tx *dbcore.Tx,
	user domain.UserID,
) (bool, common.Error) {
	limit := config.CNR().MaxSuggestionsPerUser

	builder := repo.entries.SelectBuilder("COUNT(*)")
	builder.Where(builder.Equal(cnrEntryFieldNamedBy, user))
	builder.Where(builder.Equal(cnrEntryFieldStatus, domain.NamesRegistryEntryStatusSuggested))
	builder.Limit(limit)

	var result int
	err := tx.RunQuery(builder, &result)
	if err != nil {
		return true, err
	}

	return result >= limit, nil
}
