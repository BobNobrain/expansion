package components

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"time"
)

type DataFrontRequestID int

type DataFrontRequest struct {
	ID       DataFrontRequestID
	ClientID domain.ClientID
	OnBehalf domain.UserID
	Type     string
	Received time.Time
	Request  json.RawMessage
}

type DataFront interface {
	HandleRequest(DataFrontRequest) (common.Encodable, common.Error)
}
