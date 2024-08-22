package galaxy

import (
	"srv/internal/components"
	"srv/internal/components/dispatcher"
	"srv/internal/decodables"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

const galaxyDispatcherScope components.DispatcherScope = "galaxy"

type galaxyQueryHandler struct {
	galaxy *gameGalaxy
}

func newGalaxyHandler(g *gameGalaxy) components.DispatcherCommandHandler {
	return &galaxyQueryHandler{galaxy: g}
}

func (*galaxyQueryHandler) GetScope() components.DispatcherScope {
	return galaxyDispatcherScope
}

func (h *galaxyQueryHandler) HandleCommand(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	switch cmd.Command {
	case "getSectorContent":
		params, err := decodables.DecodeWorldGetStarsPayload(cmd)
		if err != nil {
			return nil, err
		}

		content := h.galaxy.querySectorContent(params)
		return encodables.NewGetSectorContentResultEncodable(content), nil

	case "getOverview":
		limit, err := decodables.DecodeWorldGetGalaxyOverviewPayload(cmd)
		if err != nil {
			return nil, err
		}

		sectors := h.galaxy.grid.GetSectors()
		beacons := h.galaxy.queryBeacons(limit)

		return encodables.NewGalaxyOverviewEncodable(sectors, beacons), nil

	case "getSystemContent":
		systemId, err := decodables.DecodeWorldGetSystemContentPayload(cmd)
		if err != nil {
			return nil, err
		}

		sys := h.galaxy.systemsById[systemId]
		if sys == nil {
			return nil, common.NewError("ERR_NOT_FOUND", "star system not found")
		}

		// TODO: for testing purposes, to be removed in future
		if !sys.IsExplored() {
			sys.Explore(cmd.OnBehalf.ID)
		}

		return encodables.NewGetSystemContentResultEncodable(sys), nil
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}
