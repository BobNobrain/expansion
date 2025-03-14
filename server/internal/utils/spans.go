package utils

type Span struct {
	Start float64
	End   float64
}

func MakeSpan(start, end float64) Span {
	return Span{Start: min(start, end), End: max(start, end)}
}
func MakeSpanAround(middle, delta float64) Span {
	return Span{Start: middle - delta, End: middle + delta}
}

func (s Span) IsEmpty() bool {
	return s.Start == s.End
}

func (s Span) Contains(x float64) bool {
	return s.Start <= x && x <= s.End
}

func (s1 Span) OverlapsWith(s2 Span) bool {
	return !s1.Intersect(s2).IsEmpty()
}

func (s1 Span) Intersect(s2 Span) Span {
	newStart := max(s1.Start, s2.Start)
	newEnd := min(s1.End, s2.End)
	if newStart > newEnd {
		return Span{}
	}
	return Span{Start: newStart, End: newEnd}
}

// Maps a unit value (0.0..1.0) into a value inside the span.
// Example: MakeSpan(-1, 1).SampleAt(0.5) is 0
func (s Span) SampleAt(unit float64) float64 {
	return s.Start + (s.End-s.Start)*unit
}

// Maps a value inside the span into a unit value.
// Example: MakeSpan(-1, 1).RelativePos(0) is 0.5
func (s Span) RelativePos(sample float64) float64 {
	return (sample - s.Start) / (s.End - s.Start)
}

func (s Span) Clamp(value float64) float64 {
	if value < s.Start {
		return s.Start
	}
	if value > s.End {
		return s.End
	}
	return value
}
