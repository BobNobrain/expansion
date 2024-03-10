package domain

import (
	"fmt"
	"math/rand"
	"srv/internal/utils"
	"strings"
)

type CelestialID string

func CreateStarID(sectorId GalacticSectorID, index int) CelestialID {
	return CelestialID(fmt.Sprintf("%s-%03d", sectorId, index))
}

func CreatePlanetID(starId CelestialID, index int) CelestialID {
	const letters = "abcdefghijklmnopqrstuvwxyz"

	if index < len(letters) {
		return CelestialID([]byte{letters[index%len(letters)]})
	}

	return CelestialID(fmt.Sprintf("%d", index))
}

func CreateMoonID(planetId CelestialID, index int) CelestialID {
	return CelestialID(fmt.Sprintf("%s_%s", planetId, strings.ToLower(utils.ToRomanNumeral(index))))
}

func CreateAsteroidID(starID CelestialID, rnd *rand.Rand) CelestialID {
	asterId := utils.GenerateRandomStringIDFormatted("aa-00-****", rnd) // a8bh1l8n
	return CelestialID(fmt.Sprintf("%s_%s", starID, asterId))
}
