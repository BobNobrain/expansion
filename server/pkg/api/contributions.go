package api

import "time"

type Contribution struct {
	Required map[string]float64        `json:"required"`
	History  []ContributionHistoryItem `json:"history"`
}

type ContributionHistoryItem struct {
	Author string             `json:"author"`
	Date   time.Time          `json:"date"`
	Delta  map[string]float64 `json:"delta"`
}
