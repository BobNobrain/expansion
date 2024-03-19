package decodables

import (
	"encoding/json"
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

func DecodeWorldGetStarsPayload(cmd *components.DispatcherCommand) (domain.CelestialListParams, common.Error) {
	var payload api.WorldGetSectorContentPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return domain.CelestialListParams{}, newDecodeError(err)
	}

	return domain.CelestialListParams{
		SectorID: domain.GalacticSectorID(payload.SectorID),
		Limit:    payload.Limit,
	}, nil
}

func DecodeWorldGetGalaxyOverviewPayload(cmd *components.DispatcherCommand) (domain.CelestialListParams, common.Error) {
	var payload api.WorldGetGalaxyOverviewPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return domain.CelestialListParams{}, newDecodeError(err)
	}

	if payload.LandmarksLimit > 200 || payload.LandmarksLimit < 0 {
		payload.LandmarksLimit = 200
	}

	return domain.CelestialListParams{
		Limit:             payload.LandmarksLimit,
		OrderByLuminosity: true,
	}, nil
}
