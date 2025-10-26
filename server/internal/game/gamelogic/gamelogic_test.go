package gamelogic_test

import (
	"fmt"
	"math"
	"srv/internal/game"
	"testing"
)

func assert(t *testing.T, predicate bool, message string) {
	if !predicate {
		t.Fatal(message)
	}
}

func assertFloatEquals(t *testing.T, actual, expected float64, name string) {
	if math.Abs(expected-actual) > 1e-6 {
		t.Fatalf("%s is wrong: expected %f, actual %f", name, expected, actual)
	}
}

func assertInventoryAmount(t *testing.T, inventory map[game.CommodityID]float64, cid string, amt float64) {
	assertFloatEquals(t, inventory[game.CommodityID(cid)], amt, fmt.Sprintf("amount of %s", cid))
}
