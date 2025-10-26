package datafront

import (
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
