package game

import (
	"fmt"
	"srv/internal/domain"
	"srv/internal/utils"
	"time"
)

type CityID int

func (cid CityID) String() string {
	return fmt.Sprintf("%d", cid)
}

type City struct {
	CityID  CityID
	WorldID CelestialID
	TileID  TileID

	Name          string
	EstablishedAt time.Time
	EstablishedBy domain.UserID

	CityLevel         int
	CityBuildings     map[CityBuildingID]int
	UnderConstruction []CityContructionSite

	Population CityPopulationData

	CityTiles []TileID
}

type CityBuildingID string

type CityContructionSite struct {
	Building    CityBuildingID
	Contributed *Contrubution
}

type CityPopulationData struct {
	ByWorkforceType map[WorkforceType]*utils.LinearEV
}

func GetInitialCityPopulation() CityPopulationData {
	data := CityPopulationData{
		ByWorkforceType: make(map[WorkforceType]*utils.LinearEV),
	}

	now := time.Now()

	data.ByWorkforceType[WorkforceTypeIntern] = &utils.LinearEV{InitialValue: 150, LastUpdated: now, Speed: 0}
	data.ByWorkforceType[WorkforceTypeWorker] = &utils.LinearEV{InitialValue: 100, LastUpdated: now, Speed: 0}
	data.ByWorkforceType[WorkforceTypeEngineer] = &utils.LinearEV{InitialValue: 50, LastUpdated: now, Speed: 0}

	return data
}
