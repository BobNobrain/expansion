package geom_test

import (
	"srv/internal/utils/geom"
	"testing"
)

func TestSpatialGraph(t *testing.T) {
	coords := []geom.Vec3{
		{1, 0, 0},
		{0, 1, 0},
		{0, 0, 1},
	}

	sg := geom.NewSpatialGraph(3)
	sg.SetCoords(0, coords[0])
	sg.SetCoords(1, coords[1])
	sg.SetCoords(2, coords[2])
	sg.Connect(0, 1)
	sg.Connect(2, 0)

	for i := 0; i < 3; i++ {
		if !sg.GetCoords(i).IsEqualTo(coords[i]) {
			t.Fatalf("wrong coords: %d %v", i, sg.GetCoords(0))
		}
	}

	if !sg.AreConnected(0, 1) {
		t.Fatal("0 and 1 must be connected")
	}
	if !sg.AreConnected(1, 0) {
		t.Fatal("1 and 0 must be connected")
	}
	if !sg.AreConnected(0, 2) {
		t.Fatal("0 and 2 must be connected")
	}
	if !sg.AreConnected(2, 0) {
		t.Fatal("2 and 0 must be connected")
	}
	if sg.AreConnected(2, 1) {
		t.Fatal("2 and 1 must not be connected")
	}
	if sg.AreConnected(1, 2) {
		t.Fatal("1 and 2 must not be connected")
	}
}
