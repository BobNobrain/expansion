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
