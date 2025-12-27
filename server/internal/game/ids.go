package game

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
	if len(cid) == 6 {
		return true
	}

	if len(cid) == 7 {
		return cid[6] >= 'A' && cid[6] <= 'Z'
	}

	return false
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
	if len(cid) != 17 && len(cid) != 18 {
		return false
	}

	return true
}

type GalacticTileID string

func MakeGalacticTileID(worldID CelestialID, tileID TileID) GalacticTileID {
	return GalacticTileID(fmt.Sprintf("%s#%s", worldID, tileID.String()))
}

func (id GalacticTileID) GetWorldID() CelestialID {
	idx := strings.Index(string(id), "#")
	if idx == -1 {
		return ""
	}

	return CelestialID(id[:idx])
}
func (id GalacticTileID) GetTileID() TileID {
	idx := strings.Index(string(id), "#")
	if idx == -1 {
		return -1
	}

	return ParseTileIDString(string(id[idx+1:]))
}
func (id GalacticTileID) String() string {
	return string(id)
}
