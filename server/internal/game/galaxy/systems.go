package galaxy

import (
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/internal/world/wsm"
)

func (g *gameGalaxy) loadSystems() common.Error {
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

		g.systemsById[sid] = systemState
	}

	return nil
}
