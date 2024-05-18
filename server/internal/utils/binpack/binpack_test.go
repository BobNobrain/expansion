package binpack_test

import (
	"bytes"
	"srv/internal/utils/binpack"
	"srv/internal/utils/phys"
	"srv/internal/world"
	"testing"
)

type arbitraryStruct struct {
	X       int32
	Name    string
	Mass    phys.Mass
	Sectors []world.GalacticSector
}

func TestBinpack(t *testing.T) {
	s := arbitraryStruct{
		X:    42,
		Name: "jeff",
		Mass: phys.Kilograms(15),
		Sectors: []world.GalacticSector{
			{
				ID:     world.GalacticSectorID("AA"),
				Coords: world.GalacticSectorCoords{InnerR: 0, OuterR: 1, ThetaStart: 0, ThetaEnd: 1},
			},
			{
				ID:     world.GalacticSectorID("BB"),
				Coords: world.GalacticSectorCoords{InnerR: 1, OuterR: 10, ThetaStart: 0, ThetaEnd: 14},
			},
			{
				ID:     world.GalacticSectorID("CC"),
				Coords: world.GalacticSectorCoords{InnerR: 7, OuterR: 77, ThetaStart: 6, ThetaEnd: 1},
			},
		},
	}

	buf := new(bytes.Buffer)
	w := binpack.NewWriter(buf)

	binpack.Write(w, s)
	if w.GetError() != nil {
		t.Errorf("write failed: %+v", w.GetError())
	}

	r := binpack.NewReaderFromBytes(buf.Bytes())

	reassembled := binpack.Read[arbitraryStruct](r)
	if r.GetError() != nil {
		t.Errorf("read failed: %+v", r.GetError())
	}

	if reassembled.X != s.X {
		t.Errorf("X: %+v != %+v", s.X, reassembled.X)
	}
	if reassembled.Name != s.Name {
		t.Errorf("Name: %+v != %+v", s.Name, reassembled.Name)
	}
	if reassembled.Mass.Kilograms() != s.Mass.Kilograms() {
		t.Errorf("Mass: %+v != %+v", s.Mass, reassembled.Mass)
	}

	if len(reassembled.Sectors) != len(s.Sectors) {
		t.Errorf("len(Sectors): %+v != %+v", s.Sectors, reassembled.Sectors)
	}

	for i, reassembledSector := range reassembled.Sectors {
		sourceSector := s.Sectors[i]

		if reassembledSector.ID != sourceSector.ID {
			t.Errorf("Sectors[%d].ID: %+v != %+v", i, sourceSector.ID, reassembledSector.ID)
		}
		if reassembledSector.Coords.InnerR != sourceSector.Coords.InnerR {
			t.Errorf("Sectors[%d].Coords.InnerR: %+v != %+v", i, sourceSector.Coords.InnerR, reassembledSector.Coords.InnerR)
		}
		if reassembledSector.Coords.OuterR != sourceSector.Coords.OuterR {
			t.Errorf("Sectors[%d].Coords.OuterR: %+v != %+v", i, sourceSector.Coords.OuterR, reassembledSector.Coords.OuterR)
		}
		if reassembledSector.Coords.ThetaStart != sourceSector.Coords.ThetaStart {
			t.Errorf("Sectors[%d].Coords.ThetaStart: %+v != %+v", i, sourceSector.Coords.ThetaStart, reassembledSector.Coords.ThetaStart)
		}
		if reassembledSector.Coords.ThetaEnd != sourceSector.Coords.ThetaEnd {
			t.Errorf("Sectors[%d].Coords.ThetaEnd: %+v != %+v", i, sourceSector.Coords.ThetaEnd, reassembledSector.Coords.ThetaEnd)
		}
	}
}
