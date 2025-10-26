package db

import (
	"context"
	"encoding/json"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/internal/utils/predictable"
	"time"
)

type citiesRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

type cityPopulationDataJSON struct {
	Counts map[int]predictable.EncodedPredictable `json:"counts"`
}
type cityDataJSON struct {
	Buildings map[string]int `json:"buildings"`
	Tiles     []int          `json:"tiles"`
}

func (c *citiesRepoImpl) Create(payload components.CreateCityPayload) common.Error {
	uuid, err := parseUUID(string(payload.Founder))
	if err != nil {
		return err
	}

	cityData := cityDataJSON{
		Buildings: make(map[string]int),
		Tiles:     make([]int, 0, len(payload.ClaimedTiles)),
	}
	for _, tid := range payload.ClaimedTiles {
		cityData.Tiles = append(cityData.Tiles, int(tid))
	}
	cityDataEncoded, jerr := json.Marshal(cityData)
	if jerr != nil {
		return makeDBError(jerr, "CitiesRepo::Create(cityData.ToJSON)")
	}

	totalPops := int32(0)
	now := time.Now()
	populationData := cityPopulationDataJSON{
		Counts: make(map[int]predictable.EncodedPredictable),
	}
	for wf, count := range payload.Population.ByWorkforceType {
		populationData.Counts[int(wf)] = count.Wrap()
		totalPops += int32(count.Sample(now))
	}
	populationDataEncoded, jerr := json.Marshal(populationData)
	if jerr != nil {
		return makeDBError(jerr, "CitiesRepo::Create(populationData.ToJSON)")
	}

	dbErr := c.q.CreateCity(c.ctx, dbq.CreateCityParams{
		Name:           payload.CityName,
		SystemID:       string(payload.WorldID.GetStarSystemID()),
		WorldID:        string(payload.WorldID),
		TileID:         int16(payload.TileID),
		EstablishedBy:  uuid,
		CityData:       cityDataEncoded,
		PopulationData: populationDataEncoded,
		Population:     totalPops,
	})

	if dbErr != nil {
		return makeDBError(dbErr, "CitiesRepo::Create")
	}
	return nil
}

func (c *citiesRepoImpl) GetByWorldID(wid game.CelestialID) ([]game.City, common.Error) {
	dbCities, err := c.q.GetWorldCities(c.ctx, string(wid))
	if err != nil {
		return nil, makeDBError(err, "CitiesRepo::GetByWorldID")
	}

	return utils.MapSliceFailable(dbCities, decodeCity)
}

func (c *citiesRepoImpl) ResolveIDs(ids []game.CityID) ([]game.City, common.Error) {
	dbCities, err := c.q.ResolveCityIDs(c.ctx, utils.ConvertInts[game.CityID, int32](ids))
	if err != nil {
		return nil, makeDBError(err, "CitiesRepo::ResolveIDs")
	}

	return utils.MapSliceFailable(dbCities, decodeCity)
}

func decodeCity(dbCity dbq.City) (game.City, common.Error) {
	buildings := make(map[game.CityBuildingID]int)
	cityTiles := make([]game.TileID, 0)
	population := game.CityPopulationData{
		ByWorkforceType: make(map[game.WorkforceType]predictable.Predictable),
	}

	cityData, err := parseJSON[cityDataJSON](dbCity.CityData)
	if err != nil {
		return game.City{}, err
	}
	populationData, err := parseJSON[cityPopulationDataJSON](dbCity.PopulationData)
	if err != nil {
		return game.City{}, err
	}

	for buildingId, count := range cityData.Buildings {
		buildings[game.CityBuildingID(buildingId)] = count
	}
	for _, tileId := range cityData.Tiles {
		cityTiles = append(cityTiles, game.TileID(tileId))
	}
	for wf, count := range populationData.Counts {
		decodedCount := count.ToPredictable()
		if decodedCount == nil {
			continue
		}

		population.ByWorkforceType[game.WorkforceType(wf)] = decodedCount
	}

	return game.City{
		CityID:            game.CityID(dbCity.ID),
		WorldID:           game.CelestialID(dbCity.WorldID),
		TileID:            game.TileID(dbCity.TileID),
		Name:              dbCity.Name,
		EstablishedAt:     dbCity.EstablishedAt.Time,
		EstablishedBy:     domain.UserID(dbCity.EstablishedBy.String()),
		CityLevel:         int(dbCity.CityLevel),
		CityBuildings:     buildings,
		UnderConstruction: nil,
		Population:        population,
		CityTiles:         cityTiles,
	}, nil
}
