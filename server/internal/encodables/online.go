package encodables

import "srv/pkg/api"

type OnlineCountChangePayload struct {
	Count int
}

func NewOnlineCountChangePayload(count int) *OnlineCountChangePayload {
	return &OnlineCountChangePayload{
		Count: count,
	}
}

func (ev *OnlineCountChangePayload) Encode() interface{} {
	return api.OnlineCountChangeEventPayload{
		Count: ev.Count,
	}
}
