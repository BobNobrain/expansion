package galaxy

import (
	"srv/internal/domain"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
)

type galaxyAutosaveTask struct {
	g *gameGalaxy
}

func (t *galaxyAutosaveTask) Update() {
	errors := t.g.saveState()
	logger.Info(logger.FromMessage("worldAutoSaver", "The world has been saved"))

	for _, e := range errors {
		logger.Error(logger.FromError("worldAutoSaver", e))
	}
}

func (g *gameGalaxy) scheduleAutoUpdate() {
	// g.updater.ScheduleUpdateAfter(&worldRunnerAutosaveTask{r: r}, r.autosaveInterval)
}

func (g *gameGalaxy) saveState() []common.Error {
	g.lock.RLock()

	errors := make([]common.Error, 0)
	blobs := make([]*domain.OpaqueBlob, 0, len(g.systemsById))

	for _, systemState := range g.systemsById {
		blob, err := systemState.SaveState()
		if err != nil {
			errors = append(errors, err)
			continue
		}

		blobs = append(blobs, blob)
	}

	g.lock.RUnlock()

	for _, blob := range blobs {
		err := g.starSystems.Update(blob)
		if err != nil {
			errors = append(errors, err)
		}
	}

	return errors
}
