package world

import (
	"srv/internal/domain"
	"time"
)

type ExplorationData struct {
	By domain.UserID
	At time.Time
}

type PopulationOverview struct {
	Population int
	NBases     int
	NCities    int
}
