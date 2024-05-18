package runner

import (
	"srv/internal/components"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
)

type multirunner struct {
	runners []components.Runner
}

func NewMultipleRunner(runners []components.Runner) components.Runner {
	return &multirunner{
		runners: runners,
	}
}

func (m *multirunner) Start() common.Error {
	for _, r := range m.runners {
		err := r.Start()
		if err != nil {
			m.Stop()
			return err
		}
	}

	return nil
}

func (m *multirunner) Stop() common.Error {
	var lastError common.Error
	for _, r := range m.runners {
		err := r.Stop()
		if err != nil {
			logger.Error(logger.FromError("multirunner", err))
			lastError = err
		}
	}

	return lastError
}
