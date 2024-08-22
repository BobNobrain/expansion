package debug

import "srv/internal/utils/common"

type DebugData interface {
	common.Encodable
	SetValue(string, any)
}

func NewDebug() DebugData {
	return &debugData{
		values: make(map[string]any),
	}
}

func NewNoopDebug() DebugData {
	return &noopDebugData{}
}

type debugData struct {
	values map[string]any
}

func (data *debugData) Encode() any {
	return data.values
}

func (data *debugData) SetValue(key string, value any) {
	data.values[key] = value
}

type noopDebugData struct{}

func (*noopDebugData) Encode() any {
	return nil
}

func (*noopDebugData) SetValue(string, any) {}
