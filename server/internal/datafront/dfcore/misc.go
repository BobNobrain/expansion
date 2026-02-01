package dfcore

import (
	"srv/internal/components"
	"srv/internal/domain"
)

func MakeDFRequestContext(rq components.DataFrontRequest) domain.RequestContext {
	return domain.RequestContext{
		ClientID: rq.ClientID,
		UserID:   rq.OnBehalf,
		Received: rq.Received,
	}
}
