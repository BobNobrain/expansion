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
		History: utils.MapSlice(c.History, func(item game.ContrubutionHistoryItem) contributionJSONHistoryItem {
			return contributionJSONHistoryItem{
				Amounts: item.AmountsProvided.ToMap(),
				Author:  string(item.Contributor),
				Date:    item.Date,
			}
		}),
	}

	return result
}

func decodeContributionJSON(c contributionJSON) *game.Contribution {
	result := &game.Contribution{
		AmountsRequired: game.MakeInventoryFrom(c.Required),
		History: utils.MapSlice(c.History, func(item contributionJSONHistoryItem) game.ContrubutionHistoryItem {
			return game.ContrubutionHistoryItem{
				AmountsProvided: game.MakeInventoryDeltaFrom(item.Amounts),
				Contributor:     domain.UserID(item.Author),
				Date:            item.Date,
			}
		}),
	}

	return result
}
