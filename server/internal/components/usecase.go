package components

import (
	"context"
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type Usecase[Input any] interface {
	Run(context.Context, Input, UsecaseContext) common.Error
}

type UsecaseWithOutput[Input any, Output any] interface {
	Run(context.Context, Input, UsecaseContext) (Output, common.Error)
}

type UsecaseContext struct {
	Author domain.UserID
}
