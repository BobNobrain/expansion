package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type citiesTable struct {
	repo components.CitiesRepoReadonly
	sub  *events.Subscription

	table      *dfcore.QueryableTable
	qByWorldID *dfcore.TrackableTableQuery[api.CitiesQueryByWorldID]
}

func (gdf *GameDataFront) InitCities(repo components.CitiesRepoReadonly) {
	if gdf.cities != nil {
		panic("GameDataFront.InitCities() has already been called!")
	}

	cities := &citiesTable{
		repo: repo,
		sub:  events.NewSubscription(),
	}
	cities.table = dfcore.NewQueryableTable(cities.queryByIDs)
	cities.qByWorldID = dfcore.NewTrackableTableQuery(cities.queryByWorldID, cities.table)

	events.SubscribeTyped(cities.sub, events.CityCreated, cities.onNewCityFounded)

	gdf.cities = cities
	gdf.df.AttachTable("cities", cities.table)
	gdf.df.AttachTableQuery("cities/byWorldId", cities.qByWorldID)
}

func (t *citiesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *citiesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	cities, err := t.repo.ResolveIDs(utils.ParseInts[game.CityID](req.IDs))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(cities, identifyCity, encodeCity), nil
}

func (t *citiesTable) queryByWorldID(
	payload api.CitiesQueryByWorldID,
	_ dfapi.DFTableQueryRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	worldId := game.CelestialID(payload.WorldID)
	if worldId.IsStarID() {
		return nil, common.NewValidationError("CitiesQueryBySystemID::WorldID", "wrong world id")
	}

	cities, err := t.repo.GetByWorldID(worldId)
	if err != nil {
		return nil, err
	}

	result := dfcore.NewTableResponse()
	for _, city := range cities {
		result.Add(dfcore.EntityID(city.CityID.String()), encodeCity(city))
	}

	return result, nil
}

func (t *citiesTable) onNewCityFounded(payload events.CityCreatedPayload) {
	t.qByWorldID.PublishChangedNotification(api.CitiesQueryByWorldID{WorldID: string(payload.WorldID)})
}

func identifyCity(city game.City) dfcore.EntityID {
	return dfcore.EntityID(city.CityID.String())
}

func encodeCity(city game.City) common.Encodable {
	buildings := make(map[string]int)
	for bid, count := range city.CityBuildings {
		buildings[string(bid)] = count
	}

	popCounts := make(map[string]api.Predictable)
	for wf, count := range city.Population.ByWorkforceType {
		popCounts[wf.String()] = encodePredictable(count.Wrap())
	}

	return common.AsEncodable(api.CitiesTableRow{
		CityID:           int(city.CityID),
		WorldID:          string(city.WorldID),
		CenterTileID:     int(city.TileID),
		Name:             city.Name,
		EstablishedAt:    city.EstablishedAt,
		EstablishedBy:    string(city.EstablishedBy),
		CityBuildings:    buildings,
		PopulationCounts: popCounts,
		CityTiles:        utils.ConvertInts[game.TileID, int](city.CityTiles),
	})
}
