package worldgen_test

import (
	"srv/internal/world/worldgen"
	"testing"
)

type testPair struct {
	expected float64
	actual   float64
}

func TestWorldRandom(t *testing.T) {
	wg := worldgen.NewWorldGen("deadmouse")
	r := wg.GetRandom()

	values := make(map[string]*testPair)

	sg1 := r.Global()
	values["global"] = &testPair{expected: sg1.Float64()}
	sg2 := r.Global()
	values["global"].actual = sg2.Float64()
	values["global 2"] = &testPair{expected: sg1.Float64(), actual: sg2.Float64()}

	sp1 := r.ForCelestial("TH-044c")
	values["TH-044c"] = &testPair{expected: sp1.Float64()}
	sp2 := r.ForCelestial("TH-044c")
	values["TH-044c"].actual = sp2.Float64()
	values["TH-044c 2"] = &testPair{expected: sp1.Float64(), actual: sp2.Float64()}

	for name, pair := range values {
		if pair.actual != pair.expected {
			t.Fatalf("%s: %f != %f", name, pair.expected, pair.actual)
		}
	}
}
