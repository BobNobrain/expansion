package decodables

import (
	"encoding/json"
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

func DecodeWorldGetStarsPayload(cmd *components.DispatcherCommand) (domain.GetSectorContentParams, common.Error) {
	var payload api.WorldGetSectorContentPayload
	err := json.Unmarshal(cmd.Payload, &payload)

	if err != nil {
		return domain.GetSectorContentParams{}, newDecodeError(err)
	}

	return domain.GetSectorContentParams{
		SectorID: domain.GalacticSectorID(payload.SectorID),
		Limit:    payload.Limit,
	}, nil
}
