package logger

import "srv/internal/utils/common"

type LogEntry struct {
	Source  string
	Message string
	Error   common.Error
	Details map[string]any
}

func (e *LogEntry) WithDetail(name string, value any) *LogEntry {
	e.Details[name] = value
	return e
}

func FromMessage(source string, msg string) *LogEntry {
	return &LogEntry{
		Source:  source,
		Message: msg,
		Details: make(map[string]any),
	}
}
func FromError(source string, err common.Error) *LogEntry {
	return &LogEntry{
		Source:  source,
		Message: err.Error(),
		Error:   err,
		Details: make(map[string]any),
	}
}
func FromUnknownError(source string, err error) *LogEntry {
	return &LogEntry{
		Source:  source,
		Message: err.Error(),
		Error:   common.NewUnknownError(err),
		Details: make(map[string]any),
	}
}
