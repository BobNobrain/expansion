package galaxy

import (
	"bytes"
	"srv/internal/domain"
	"srv/internal/utils/binpack"
	"srv/internal/utils/common"
	"srv/internal/world"
)

func (c *gameGalaxy) loadGrid() common.Error {
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

func SaveGalacticGrid(grid world.GalacticGrid) (*domain.OpaqueBlob, error) {
	buf := new(bytes.Buffer)
	w := binpack.NewWriter(buf)

	n := grid.Size()
	w.WriteUVarInt(uint64(n))
	for _, sector := range grid.GetSectors() {
		binpack.Write(w, sector)
	}

	if w.GetError() != nil {
		return nil, w.GetError()
	}

	result := &domain.OpaqueBlob{
		ID:      "global/galactic_grid",
		Format:  "galactic_grid",
		Version: 1,
		Data:    buf.Bytes(),
	}

	return result, nil
}
