package debug

import (
	"srv/internal/utils/common"
	"time"
)

type Timings interface {
	common.Encodable
	MarkEvent(string)
	MarkStart(string)
	MarkEnd(string)
}

func NewTimings() Timings {
	return &timings{
		Phases: make(map[string]*timingData),
		Marks:  make(map[string]int64),
	}
}

type timingData struct {
	Start    int64 `json:"start"`
	End      int64 `json:"end"`
	Duration int64 `json:"duration"`
}

type timings struct {
	Phases map[string]*timingData `json:"phases"`
	Marks  map[string]int64       `json:"marks"`
}

func (t *timings) Encode() any {
	return t
}

func (t *timings) MarkStart(key string) {
	t.Phases[key] = &timingData{
		Start: time.Now().UnixMilli(),
	}
}
func (t *timings) MarkEnd(key string) {
	entry := t.Phases[key]
	entry.End = time.Now().UnixMilli()
	entry.Duration = entry.End - entry.Start
}
func (t *timings) MarkEvent(key string) {
	t.Marks[key] = time.Now().UnixMilli()
}
