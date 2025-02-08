package components

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type DataFrontRequestID int

type DataFrontRequest struct {
	ID       DataFrontRequestID
	ClientID domain.ClientID
	OnBehalf domain.UserID
	Type     string
	Request  json.RawMessage
}

type DataFront interface {
	HandleRequest(DataFrontRequest) (common.Encodable, common.Error)
}
