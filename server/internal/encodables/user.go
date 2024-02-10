package encodables

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

type UserDataUpdatePayload struct {
	Username domain.Username
}

func NewUserDataUpdatePayload(username domain.Username) common.Encodable {
	return &UserDataUpdatePayload{
		Username: username,
	}
}

func (payload *UserDataUpdatePayload) Encode() interface{} {
	return &api.UserDataUpdateEventPayload{
		Username: string(payload.Username),
	}
}
