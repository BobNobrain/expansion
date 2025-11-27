package game

import (
	"fmt"
	"srv/internal/domain"
	"srv/internal/utils/predictable"
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
	Contributed *Contribution
}

type CityPopulationData struct {
	ByWorkforceType map[WorkforceType]predictable.Predictable
}

func GetInitialCityPopulation() CityPopulationData {
	data := CityPopulationData{
		ByWorkforceType: make(map[WorkforceType]predictable.Predictable),
	}

	data.ByWorkforceType[WorkforceTypeIntern] = predictable.NewConstant(150)
	data.ByWorkforceType[WorkforceTypeWorker] = predictable.NewConstant(100)
	data.ByWorkforceType[WorkforceTypeEngineer] = predictable.NewConstant(50)

	return data
}
