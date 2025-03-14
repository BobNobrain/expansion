package material

import (
	"srv/internal/utils"
	"srv/internal/utils/phys"
)

type PhysicalState byte

const (
	StateUnknown PhysicalState = iota
	StateSolid
	StateLiquid
	StateGas
)

func (s PhysicalState) ToString() string {
	switch s {
	case StateGas:
		return "gas"
	case StateLiquid:
		return "liquid"
	case StateSolid:
		return "solid"
	default:
		return "unknown"
	}
}

var infinitePressure = phys.Pascals(1e15)

type PhaseDiagram interface {
	Sample(at PhaseDiagramPoint) PhysicalState
}

type PhaseDiagramPoint struct {
	T phys.Temperature
	P phys.Pressure
}

type triplePointPhaseDiagram struct {
	triple          PhaseDiagramPoint
	sublimationLine []PhaseDiagramPoint
	meltingLine     []PhaseDiagramPoint
	boilingLine     []PhaseDiagramPoint
}

func (d *triplePointPhaseDiagram) Sample(at PhaseDiagramPoint) PhysicalState {
	if at.P < d.triple.P {
		tSubl := sampleLineAtP(d.sublimationLine, at.P)
		if at.T < tSubl {
			return StateSolid
		}
		return StateGas
	}

	// it is important to check for solidity first
	// because of the way we form the lines:
	// boiling line goes straight vertically at the end
	// (into inf pressure at constant supercritical temp),
	// overlapping with the region of solid state
	tMelt := sampleLineAtP(d.meltingLine, at.P)
	if at.T < tMelt {
		return StateSolid
	}
	tBoil := sampleLineAtP(d.boilingLine, at.P)
	if at.T >= tBoil {
		return StateGas
	}
	return StateLiquid
}

func NewTriplePointPhaseDiagram(
	triplePoint PhaseDiagramPoint,
	sublLine []PhaseDiagramPoint,
	meltLine []PhaseDiagramPoint,
	boilLine []PhaseDiagramPoint,
) PhaseDiagram {
	result := &triplePointPhaseDiagram{
		triple:          triplePoint,
		sublimationLine: make([]PhaseDiagramPoint, 0, len(sublLine)+1),
		meltingLine:     make([]PhaseDiagramPoint, 0, len(sublLine)+2),
		boilingLine:     make([]PhaseDiagramPoint, 0, len(sublLine)+2),
	}

	// constructing sublimation line
	result.sublimationLine = append(result.sublimationLine, sublLine...)
	result.sublimationLine = append(result.sublimationLine, triplePoint)

	// constructing melting line
	result.meltingLine = append(result.meltingLine, triplePoint)
	result.meltingLine = append(result.meltingLine, meltLine...)

	meltingPointAtInfinity := PhaseDiagramPoint{T: phys.Kelvins(1e7)}
	meltLineLast := result.meltingLine[len(result.meltingLine)-1]
	meltLineBeforeLast := result.meltingLine[len(result.meltingLine)-2]
	// lerping the infinity point, as it is a linear continuation of the last segment
	meltingPointAtInfinity.P = utils.Lerp(meltLineBeforeLast.P, meltLineLast.P, utils.Unlerp(meltLineBeforeLast.T, meltLineLast.T, meltingPointAtInfinity.T))
	result.meltingLine = append(result.meltingLine, meltingPointAtInfinity)

	// constructing boiling line
	result.boilingLine = append(result.boilingLine, triplePoint)
	result.boilingLine = append(result.boilingLine, boilLine...)

	critPoint := boilLine[len(boilLine)-1]
	// ramp the line up vertically
	result.boilingLine = append(result.boilingLine, PhaseDiagramPoint{
		T: critPoint.T,
		P: infinitePressure,
	})

	return result
}

type heliumPhaseDiagram struct {
	meltingLine []PhaseDiagramPoint
	boilingLine []PhaseDiagramPoint
}

func (d *heliumPhaseDiagram) Sample(at PhaseDiagramPoint) PhysicalState {
	tBoil := sampleLineAtP(d.boilingLine, at.P)
	tMelt := sampleLineAtP(d.meltingLine, at.P)

	if !tBoil.IsValid() || at.T >= tBoil {
		return StateGas
	}

	if tMelt.IsValid() && at.T < tMelt {
		return StateSolid
	}

	return StateLiquid
}

func NewHeliumPhaseDiagram(
	meltLine []PhaseDiagramPoint,
	boilLine []PhaseDiagramPoint,
) PhaseDiagram {
	result := &heliumPhaseDiagram{
		meltingLine: meltLine,
		boilingLine: boilLine,
	}

	critPoint := boilLine[len(boilLine)-1]
	result.boilingLine = append(result.boilingLine, PhaseDiagramPoint{T: critPoint.T, P: infinitePressure})

	lastMeltingPoint := meltLine[len(meltLine)-1]
	result.meltingLine = append(result.meltingLine, PhaseDiagramPoint{T: lastMeltingPoint.T + 0.1, P: infinitePressure})

	return result
}

type meltPhaseDiagram struct {
	meltingLine []PhaseDiagramPoint
}

func (d *meltPhaseDiagram) Sample(at PhaseDiagramPoint) PhysicalState {
	tMelt := sampleLineAtP(d.meltingLine, at.P)
	if at.T >= tMelt {
		return StateLiquid
	}
	return StateSolid
}

func NewMeltPhaseDiagram(meltLine []PhaseDiagramPoint) PhaseDiagram {
	result := &meltPhaseDiagram{
		meltingLine: make([]PhaseDiagramPoint, 0),
	}
	if len(meltLine) == 1 {
		result.meltingLine = append(result.meltingLine, PhaseDiagramPoint{
			T: meltLine[0].T,
			P: phys.Pascals(0),
		})
	}
	result.meltingLine = append(result.meltingLine, meltLine...)
	result.meltingLine = append(result.meltingLine, PhaseDiagramPoint{
		P: infinitePressure,
		T: result.meltingLine[len(result.meltingLine)-1].T,
	})

	return result
}

func sampleLineAtP(line []PhaseDiagramPoint, p phys.Pressure) phys.Temperature {
	n := len(line)
	for i := 0; i < n-1; i++ {
		pt1 := line[i]
		pt2 := line[i+1]

		pMin := min(pt1.P, pt2.P)
		pMax := max(pt1.P, pt2.P)

		if pMin <= p && p < pMax {
			// find the exact spot on the line segment
			t := utils.Lerp(pt1.T, pt2.T, utils.Unlerp(pt1.P, pt2.P, p))
			return t
		}
	}

	return phys.Kelvins(-1)
}
