package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type systemsTable struct {
	repo  components.StarSystemsRepo
	table *dfcore.QueryableTable
	sub   eb.Subscription
}

func (gdf *GameDataFront) InitSystems(repo components.StarSystemsRepo) {
	if gdf.systems != nil {
		panic("GameDataFront.InitSystems() has already been called!")
	}

	systems := &systemsTable{
		repo: repo,
		sub:  eb.CreateSubscription(),
	}
	systems.table = dfcore.NewQueryableTable(systems.queryByIDs)

	eb.SubscribeTyped(systems.sub, events.SourceGalaxy, events.EventGalaxySystemUpdate, systems.onSystemUpdated)

	gdf.systems = systems
	gdf.df.AttachTable(dfcore.DFPath("systems"), systems.table)
}

func (t *systemsTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *systemsTable) queryByIDs(
	req dfapi.DFTableRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	systemIDs := make([]world.StarSystemID, 0, len(req.IDs))
	for _, id := range req.IDs {
		systemID := world.StarSystemID(id)
		if !systemID.IsValid() {
			return nil, common.NewValidationError("SystemsQueryByID::SystemID", "wrong system id")
		}

		systemIDs = append(systemIDs, systemID)
	}

	systems, err := t.repo.GetContentMany(systemIDs)
	if err != nil {
		return nil, err
	}

	response := dfcore.NewTableResponse()
	for _, system := range systems {
		response.Add(dfcore.EntityID(system.ID), encodeSystem(system))
	}

	return response, nil
}

func (t *systemsTable) onSystemUpdated(payload events.GalaxySystemUpdate, _ eb.Event) {
	system, err := t.repo.GetContent(payload.SystemID)
	if err != nil {
		logger.Error(logger.FromError("DF/systems", err).WithDetail("event", "galaxy:systemUpdate"))
		return
	}

	update := make(map[dfcore.EntityID]common.Encodable)
	update[dfcore.EntityID(payload.SystemID)] = encodeSystem(system)
	t.table.PublishEntities(update)
}

func encodeSystem(system world.StarSystemContent) common.Encodable {
	stars := make(map[string]api.SysOverviewsTableRowStar, len(system.Stars))
	for _, star := range system.Stars {
		stars[string(star.ID)] = api.SysOverviewsTableRowStar{
			ID:             string(star.ID),
			TempK:          star.Params.Temperature.Kelvins(),
			LuminositySuns: star.Params.Luminosity.Suns(),
			RadiusAu:       star.Params.Radius.AstronomicalUnits(),
			MassSuns:       star.Params.Mass.SolarMasses(),
			AgeByrs:        star.Params.Age.BillionYears(),
		}
	}

	orbits := make(map[string]api.SystemsTableRowOrbit, len(system.Orbits))
	for bodyID, orbit := range system.Orbits {
		orbits[string(bodyID)] = api.SystemsTableRowOrbit{
			OrbitsAround:         string(orbit.Center),
			OrbitSemiMajorAxisAu: orbit.Ellipse.SemiMajor.AstronomicalUnits(),
			OrbitEccentricity:    orbit.Ellipse.Eccentricity,
			OrbitRotation:        orbit.Rotation.Radians(),
			OrbitInclination:     orbit.Inclination.Radians(),
			TimeAtPeriapsis:      orbit.T0,
		}
	}

	return common.AsEncodable(api.SystemsTableRow{
		ID:         string(system.ID),
		ExploredBy: string(system.Explored.By),
		ExploredAt: system.Explored.At,
		Stars:      stars,
		Orbits:     orbits,
	})
}
