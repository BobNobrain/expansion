package datafront

import "strings"

type DFPathFragment string
type DFPath []DFPathFragment

func (p DFPath) Pop() (DFPath, DFPathFragment) {
	last := len(p) - 1
	if last < 0 {
		return nil, ""
	}
	return p[0:last], p[last]
}

func (p DFPath) String() string {
	return strings.Join(p.StringArray(), "/")
}

func (p DFPath) StringArray() []string {
	strs := make([]string, 0, len(p))
	for _, f := range p {
		strs = append(strs, string(f))
	}
	return strs
}
