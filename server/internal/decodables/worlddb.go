package decodables

import (
	"encoding/json"
	"srv/internal/components"
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
	"srv/internal/world"
	"srv/pkg/api"
)

func DecodeWorldGetStarsPayload(cmd *components.DispatcherCommand) (world.GalaxySectorContentRequest, common.Error) {
	var payload api.WorldGetSectorContentPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return world.GalaxySectorContentRequest{}, newDecodeError(err)
	}

	return world.GalaxySectorContentRequest{
		SectorID: world.GalacticSectorID(payload.SectorID),
		Search:   payload.Search,
		Page: pagination.PageParams{
			Limit:  payload.Limit,
			Offset: payload.Offset,
		},
	}, nil
}

func DecodeWorldGetGalaxyOverviewPayload(cmd *components.DispatcherCommand) (int, common.Error) {
	var payload api.WorldGetGalaxyOverviewPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return 0, newDecodeError(err)
	}

	if payload.LandmarksLimit > 200 || payload.LandmarksLimit < 0 {
		payload.LandmarksLimit = 200
	}

	return payload.LandmarksLimit, nil
}
