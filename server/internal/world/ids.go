package world

import (
	"fmt"
	"math/rand"
	"srv/internal/utils"
	"strings"
)

type GalacticSectorID string

func CreateGalacticSectorID(rnd *rand.Rand) GalacticSectorID {
	return GalacticSectorID(utils.GenerateRandomStringIDFormatted("XX", rnd))
}

type StarSystemID string

func (id StarSystemID) GetSectorID() GalacticSectorID {
	return GalacticSectorID(id[0:2])
}

func (id StarSystemID) IsValid() bool {
	// TODO: improve validation
	return len(string(id)) == 6 && id[2] == '-'
}

type CelestialID string

func (cid CelestialID) IsNone() bool {
	return cid == NoCelestialID
}

const NoCelestialID CelestialID = ""

func (id CelestialID) GetSectorID() GalacticSectorID {
	return GalacticSectorID(id[0:2])
}

func CreateStarSystemID(sectorId GalacticSectorID, index int) StarSystemID {
	return StarSystemID(fmt.Sprintf("%s-%03d", sectorId, index))
}

func (cid CelestialID) IsStarSystemID() bool {
	return len(cid) == 6
}

func (cid CelestialID) GetStarSystemID() StarSystemID {
	return StarSystemID(cid[0:6])
}

func CreateStarID(systemId StarSystemID, starIndex int, isOnlyStar bool) CelestialID {
	if isOnlyStar {
		return CelestialID(systemId)
	}

	const letters = "ABCDEF"
	return CelestialID(fmt.Sprintf("%s%c", systemId, letters[starIndex]))
}

func (cid CelestialID) IsStarID() bool {
	return len(cid) == 6 || len(cid) == 7
}

func CreatePlanetID(starId CelestialID, index int) CelestialID {
	const letters = "abcdefghijklmnopqrstuvwxyz"

	var letter string
	if index < len(letters) {
		letter = string([]byte{letters[index%len(letters)]})
	} else {
		letter = fmt.Sprintf("%d", index)
	}

	return CelestialID(fmt.Sprintf("%s%s", starId, letter))
}

func (cid CelestialID) IsPlanetID() bool {
	if len(cid) < 7 {
		return false
	}

	if strings.Contains(string(cid), "_") {
		return false
	}

	lastChar := cid[len(cid)-1]
	return lastChar >= 'a' && lastChar <= 'z'
}

func CreateMoonID(planetId CelestialID, index int) CelestialID {
	return CelestialID(fmt.Sprintf("%s_%s", planetId, strings.ToLower(utils.ToRomanNumeral(index))))
}

func (cid CelestialID) IsMoonID() bool {
	if len(cid) < 9 {
		return false
	}

	if !strings.Contains(string(cid), "_") {
		return false
	}

	if strings.Contains(string(cid), "-") {
		return false
	}

	return true
}

func CreateAsteroidID(starID CelestialID, rnd *rand.Rand) CelestialID {
	asterId := utils.GenerateRandomStringIDFormatted("aa-00-****", rnd)
	return CelestialID(fmt.Sprintf("%s_%s", starID, asterId))
}

func (cid CelestialID) IsAsteroidID() bool {
	if len(cid) != 17 || len(cid) != 18 {
		return false
	}

	return true
}
