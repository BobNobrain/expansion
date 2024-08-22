package debug

import "srv/internal/utils/common"

type DebugContext interface {
	common.Encodable
	Timings() Timings
	DebugData() DebugData
}

func NewFullContext(name string) DebugContext {
	return &debugContext{
		name:    name,
		timings: NewTimings(),
		data:    NewDebug(),
	}
}
func NewLightContext(name string) DebugContext {
	return &debugContext{
		name:    name,
		timings: NewTimings(),
		data:    NewNoopDebug(),
	}
}

type debugContext struct {
	name    string
	timings Timings
	data    DebugData
}

type debugContextJson struct {
	Name    string `json:"name"`
	Timings any    `json:"timings"`
	Data    any    `json:"data"`
}

func (c *debugContext) Encode() any {
	return &debugContextJson{
		Name:    c.name,
		Timings: c.timings.Encode(),
		Data:    c.data.Encode(),
	}
}

func (c *debugContext) Timings() Timings {
	return c.timings
}
func (c *debugContext) DebugData() DebugData {
	return c.data
}
