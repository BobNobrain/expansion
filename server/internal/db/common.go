package db

import (
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils"
	"time"
)

type contributionJSON struct {
	Required map[string]float64            `json:"total"`
	History  []contributionJSONHistoryItem `json:"history"`
}

type contributionJSONHistoryItem struct {
	Amounts map[string]float64 `json:"amounts"`
	Author  string             `json:"author"`
	Date    time.Time          `json:"date"`
}

func encodeContributionJSON(c *game.Contribution) contributionJSON {
	result := contributionJSON{
		Required: c.AmountsRequired.ToMap(),
		History:  utils.MapSlice(c.History, encodeContributionJSONHistoryItem),
	}

	return result
}
func encodeContributionJSONHistoryItem(item game.ContributionHistoryItem) contributionJSONHistoryItem {
	return contributionJSONHistoryItem{
		Amounts: item.AmountsProvided.ToMap(),
		Author:  string(item.Contributor),
		Date:    item.Date,
	}
}

func decodeContributionJSON(c contributionJSON) *game.Contribution {
	result := &game.Contribution{
		AmountsRequired: game.MakeInventoryFrom(c.Required),
		History:         utils.MapSlice(c.History, decodeContributionJSONHistoryItem),
	}

	return result
}
func decodeContributionJSONHistoryItem(item contributionJSONHistoryItem) game.ContributionHistoryItem {
	return game.ContributionHistoryItem{
		AmountsProvided: game.MakeInventoryDeltaFrom(item.Amounts),
		Contributor:     domain.UserID(item.Author),
		Date:            item.Date,
	}
}
