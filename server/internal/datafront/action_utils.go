package datafront

import (
	"context"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/utils/common"
)

func newActionFromUsecase[APIInput any, UCInput any](
	uc components.Usecase[UCInput],
	inputMapper func(APIInput) UCInput,
) *dfcore.Action[APIInput] {
	return dfcore.NewAction(func(apiInput APIInput, userID domain.UserID) (common.Encodable, common.Error) {
		return common.EmptyEncodable(), uc.Run(
			context.TODO(),
			inputMapper(apiInput),
			components.UsecaseContext{Author: userID},
		)
	})
}

func newActionFromUsecaseWithResult[APIInput any, UCInput any, UCOutput any](
	uc components.UsecaseWithOutput[UCInput, UCOutput],
	inputMapper func(APIInput) UCInput,
	outputMapper func(UCOutput) common.Encodable,
) *dfcore.Action[APIInput] {
	return dfcore.NewAction(func(apiInput APIInput, userID domain.UserID) (common.Encodable, common.Error) {
		result, err := uc.Run(
			context.TODO(),
			inputMapper(apiInput),
			components.UsecaseContext{Author: userID},
		)

		if err != nil {
			return nil, err
		}

		return outputMapper(result), nil
	})
}
