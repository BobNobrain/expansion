package game

import (
	"srv/internal/components"
	"srv/internal/components/dispatcher"
	"srv/internal/decodables"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

const galaxyDispatcherScope components.DispatcherScope = "galaxy"

type galaxyQueryHandler struct {
	galaxy GalaxyMap
}

func newGalaxyHandler(g GalaxyMap) components.DispatcherCommandHandler {
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

		content := h.galaxy.QuerySectorContent(params)
		return encodables.NewGetSectorContentResultEncodable(content), nil

	case "getOverview":
		limit, err := decodables.DecodeWorldGetGalaxyOverviewPayload(cmd)
		if err != nil {
			return nil, err
		}

		sectors, beacons := h.galaxy.GetOverview(limit)
		return encodables.NewGalaxyOverviewEncodable(sectors, beacons), nil

	case "getSystemContent":
		systemId, err := decodables.DecodeWorldGetSystemContentPayload(cmd)
		if err != nil {
			return nil, err
		}

		sys, surfaces, err := h.galaxy.GetSystemContent(systemId, cmd)
		if err != nil {
			return nil, err
		}

		return encodables.NewGetSystemContentResultEncodable(sys, surfaces), nil

	case "getSurface":
		// TODO
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}
