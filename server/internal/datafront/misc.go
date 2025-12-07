package datafront

import (
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/predictable"
	"srv/pkg/api"
)

func serializePredictable(e predictable.EncodedPredictable) api.Predictable {
	if e.Constant != nil {
		return api.Predictable{
			Const: &api.ConstantPredictable{
				X: e.Constant.Value,
			},
		}
	}

	if e.Linear != nil {
		return api.Predictable{
			Linear: &api.LinearPredictable{
				X: e.Linear.X0,
				T: e.Linear.T0,
				V: e.Linear.Speed,
			},
		}
	}

	if e.Limited != nil {
		return api.Predictable{
			Limited: &api.LimitedPredictable{
				X:     e.Limited.XLim,
				Mode:  string(e.Limited.Mode),
				Inner: serializePredictable(e.Limited.Inner),
			},
		}
	}

	return api.Predictable{}
}

func encodeContribution(c *game.Contribution) api.Contribution {
	return api.Contribution{
		Required: c.AmountsRequired.ToMap(),
		History: utils.MapSlice(utils.UnNilSlice(c.History), func(item game.ContributionHistoryItem) api.ContributionHistoryItem {
			return api.ContributionHistoryItem{
				Author: string(item.Contributor),
				Date:   item.Date,
				Delta:  item.AmountsProvided.ToMap(),
			}
		}),
	}
}
