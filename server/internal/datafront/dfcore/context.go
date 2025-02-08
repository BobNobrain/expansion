package dfcore

import (
	"srv/internal/components"
	"srv/internal/domain"
)

type DFRequestContext struct {
	ClientID domain.ClientID
	OnBehalf domain.UserID
}

func MakeDFRequestContext(rq components.DataFrontRequest) DFRequestContext {
	return DFRequestContext{
		ClientID: rq.ClientID,
		OnBehalf: rq.OnBehalf,
	}
}
