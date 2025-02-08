package db

import (
	"context"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
)

type namesRegistryImpl struct {
	q *dbq.Queries
}

// TODO: is this even used anywhere?
func (n *namesRegistryImpl) GetCurrentNameOf(id string) (domain.NamesRegistryEntryShort, common.Error) {
	names, err := n.GetCurrentNamesOf([]string{id})
	if err != nil {
		return domain.NamesRegistryEntryShort{}, err
	}
	if name, found := names[id]; found {
		return name, nil
	}
	return domain.NamesRegistryEntryShort{}, makeNotFoundError("No name found")
}

func (n *namesRegistryImpl) GetCurrentNamesOf(ids []string) (map[string]domain.NamesRegistryEntryShort, common.Error) {
	dbNames, err := n.q.ResolveNames(context.Background(), ids)
	if err != nil {
		return nil, makeDBError(err, "CNR::GetCurrentNamesOf")
	}

	result := make(map[string]domain.NamesRegistryEntryShort, len(dbNames))
	for _, dbName := range dbNames {
		result[dbName.CelestialID] = domain.NamesRegistryEntryShort{
			ObjectID: dbName.CelestialID,
			Name:     dbName.Name,
			NamedBy:  domain.UserID(dbName.AuthorID.String()),
			NamedAt:  dbName.CreatedAt.Time,
		}
	}

	return result, nil
}

func (n *namesRegistryImpl) Review(review components.NamesRegistryReview) common.Error {
	reviewerUUID, err := parseUUID(string(review.Author))
	if err != nil {
		return err
	}

	if review.ShouldApprove {
		dberr := n.q.ApproveName(context.Background(), dbq.ApproveNameParams{
			EntryID:    int32(review.EntryID),
			ReviewerID: reviewerUUID,
		})
		if dberr != nil {
			return makeDBError(err, "CNR::Review(Approve)")
		}

		return nil
	}

	dberr := n.q.DeclineName(context.Background(), dbq.DeclineNameParams{
		EntryID:       int32(review.EntryID),
		ReviewerID:    reviewerUUID,
		ReviewComment: review.Comment,
	})
	if dberr != nil {
		return makeDBError(err, "CNR::Review(Decline)")
	}

	return nil
}

func (n *namesRegistryImpl) SuggestName(rq components.NamesRegistrySuggestion) common.Error {
	authorUUID, err := parseUUID(string(rq.Author))
	if err != nil {
		return err
	}

	dberr := n.q.SubmitName(context.Background(), dbq.SubmitNameParams{
		CelestialID: rq.ObjectID,
		AuthorID:    authorUUID,
		Name:        rq.Name,
	})
	if dberr != nil {
		return makeDBError(err, "CNR::SuggestName")
	}
	return nil
}

func (n *namesRegistryImpl) GetEntriesByAuthor(authorID domain.UserID, page pagination.PageParams) (pagination.Page[domain.NamesRegistryEntry], common.Error) {
	authorUUID, err := parseUUID(string(authorID))
	if err != nil {
		return pagination.EmptyPage[domain.NamesRegistryEntry](), err
	}

	rows, dberr := n.q.ListNameSubmissionsByAuthor(context.Background(), dbq.ListNameSubmissionsByAuthorParams{
		Limit:    int32(page.Limit),
		Offset:   int32(page.Offset),
		AuthorID: authorUUID,
	})
	if dberr != nil {
		return pagination.EmptyPage[domain.NamesRegistryEntry](), makeDBError(dberr, "CNR::GetEntriesByAuthor")
	}

	entries := decodeNameSuggestions(rows)

	total, dberr := n.q.ListNameEntriesByAuthorTotal(context.Background(), authorUUID)
	if dberr != nil {
		return pagination.EmptyPage[domain.NamesRegistryEntry](), makeDBError(err, "CNR::GetEntriesByAuthor(Total)")
	}

	return pagination.Page[domain.NamesRegistryEntry]{
		Items: entries,
		Page: pagination.PageInfo{
			Offset: page.Offset,
			Total:  int(total),
		},
	}, nil
}

func (n *namesRegistryImpl) GetSuggestionsBacklog(page pagination.PageParams) (pagination.Page[domain.NamesRegistryEntry], common.Error) {
	rows, dberr := n.q.ListPendingNameSubmissions(context.Background(), dbq.ListPendingNameSubmissionsParams{
		Limit:  int32(page.Limit),
		Offset: int32(page.Offset),
	})
	if dberr != nil {
		return pagination.EmptyPage[domain.NamesRegistryEntry](), makeDBError(dberr, "CNR::GetSuggestionsBacklog")
	}

	entries := decodeNameSuggestions(rows)
	total, dberr := n.q.ListPendingNameSubmissionsTotal(context.Background())
	if dberr != nil {
		return pagination.EmptyPage[domain.NamesRegistryEntry](), makeDBError(dberr, "CNR::GetSuggestionsBacklog(Total)")
	}

	return pagination.Page[domain.NamesRegistryEntry]{
		Items: entries,
		Page: pagination.PageInfo{
			Offset: page.Offset,
			Total:  int(total),
		},
	}, nil
}

func decodeNameSuggestions(rows []dbq.CelestialNamesSubmission) []domain.NamesRegistryEntry {
	entries := make([]domain.NamesRegistryEntry, 0, len(rows))
	for _, row := range rows {
		var reviewerID domain.UserID
		status := domain.NamesRegistryEntryStatusSuggested
		if row.ReviewerID.Valid {
			reviewerID = domain.UserID(row.ReviewerID.String())
			status = domain.NamesRegistryEntryStatusDeclined
		}

		entries = append(entries, domain.NamesRegistryEntry{
			EntryID:       domain.NamesRegistryEntryID(row.EntryID),
			ObjectID:      row.CelestialID,
			Name:          row.Name,
			NamedBy:       domain.UserID(row.AuthorID.String()),
			NamedAt:       row.CreatedAt.Time,
			Status:        status,
			ReviewedBy:    reviewerID,
			ReviewedAt:    row.ReviewedAt.Time,
			ReviewComment: row.ReviewComment,
		})
	}
	return entries
}
