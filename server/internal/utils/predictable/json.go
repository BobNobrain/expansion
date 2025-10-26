package predictable

type EncodedPredictable struct {
	Constant *constantPredictableImpl      `json:"c,omitempty"`
	Linear   *linearPredictableImpl        `json:"l,omitempty"`
	Limited  *limitedPredictableSerialized `json:"b,omitempty"`
}

func (u EncodedPredictable) ToPredictable() Predictable {
	if u.Constant != nil {
		return u.Constant
	}

	if u.Linear != nil {
		return u.Linear
	}

	if u.Limited != nil {
		return u.Limited.toImpl()
	}

	return nil
}
