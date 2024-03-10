package gamerunner

import (
	"srv/internal/components"
	"srv/internal/decodables"
	"srv/internal/dispatcher"
	"srv/internal/encodables"
	"srv/internal/utils/common"
	"srv/internal/world"
)

const galaxyDispatcherScope components.DispatcherScope = "galaxy"

type worldQueryHandler struct {
	galaxy *world.GalaxyContent
	store  components.Permastore
}

func (h *worldQueryHandler) AsHandler() components.DispatcherCommandHandler {
	return h
}

func (*worldQueryHandler) GetScope() components.DispatcherScope {
	return galaxyDispatcherScope
}

func (h *worldQueryHandler) HandleCommand(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	switch cmd.Command {
	case "getSectorContent":
		params, err := decodables.DecodeWorldGetStarsPayload(cmd)
		if err != nil {
			return nil, err
		}

		content, err := h.store.CelestialRepo().GetSectorContent(params)
		if err != nil {
			return nil, err
		}

		return encodables.NewGetSectorContentResultEncodable(content), nil

	case "getGrid":
		sectors := h.galaxy.Grid.GetSectors()
		return encodables.NewGalaxyGridEncodable(sectors), nil
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}
