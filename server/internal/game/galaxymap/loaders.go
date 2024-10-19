package galaxymap

import (
	"srv/internal/utils"
	"srv/internal/utils/binpack"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/internal/world/wsm"
)

func (c *galaxyMap) loadGrid() common.Error {
	gridBlob, err := c.precalcs.Get("global/galactic_grid")
	if err != nil {
		return err
	}

	sectors := make([]*world.GalacticSector, 0)
	r := binpack.NewReaderFromBytes(gridBlob.Data)
	len := int(r.ReadUVarInt())
	for i := 0; i < len; i++ {
		sector := binpack.Read[world.GalacticSector](r)
		sectors = append(sectors, &sector)
	}

	if r.GetError() != nil {
		return common.NewWrapperError("ERR_CARTOGRAPHER_LOAD", r.GetError())
	}

	c.grid = world.BuildGalacticGridFromSectorsList(sectors)
	return nil
}

func (g *galaxyMap) loadBeacons() {
	top := utils.MakeTop[world.GalaxyBeacon](200)

	for _, systemState := range g.systemsByID {
		for _, star := range systemState.GetStars() {
			beacon := world.GalaxyBeacon{
				StarID: star.ID,
				Params: star.Params,
				Coords: systemState.GetCoords(),
			}
			top.Insert(beacon, beacon.Rate())
		}
	}

	g.beacons = top.Get()
}

func (g *galaxyMap) loadSurfacesData() common.Error {
	blobs, err := g.starSystems.GetAllOfFormat(wsm.StaticSurfaceDataFormat)
	if err != nil {
		return err
	}

	for _, blob := range blobs {
		surfaceID := world.CelestialID(blob.ID)
		surfaceState := wsm.NewSurfaceSharedState()
		err = surfaceState.LoadState(blob)

		if err != nil {
			return err
		}

		g.surfacesByID[surfaceID] = surfaceState
	}

	return nil
}

func (g *galaxyMap) loadSystems() common.Error {
	blobs, err := g.starSystems.GetAllOfFormat(wsm.StaticSystemDataFormat)
	if err != nil {
		return err
	}

	for _, blob := range blobs {
		sid := world.StarSystemID(blob.ID)
		systemState := wsm.NewSystemSharedState(g.generator, sid)
		err = systemState.LoadState(blob)

		if err != nil {
			return err
		}

		g.systemsByID[sid] = systemState
	}

	return nil
}

func (g *galaxyMap) loadSectorContents() {
	g.sectors = make(map[world.GalacticSectorID][]*wsm.SystemSharedState)

	for sid, systemState := range g.systemsByID {
		sectorID := sid.GetSectorID()
		g.sectors[sectorID] = append(g.sectors[sectorID], systemState)
	}
}
