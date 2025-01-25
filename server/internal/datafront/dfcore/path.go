package dfcore

type DFPath string

func (p DFPath) String() string {
	return string(p)
}
