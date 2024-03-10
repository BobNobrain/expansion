package gamerunner

import (
	"srv/internal/components"
	"srv/internal/world"
)

type gameRunnerImpl struct {
	dispatcher components.Dispatcher
	comms      components.Comms
	store      components.Permastore

	runners []components.GameRunner
	content *world.GalaxyContent
}

func NewGameRunner(
	dispatcher components.Dispatcher,
	comms components.Comms,
	store components.Permastore,

	content *world.GalaxyContent,
) components.GameRunner {
	runners := make([]components.GameRunner, len(content.StarSystems))

	for i, system := range content.StarSystems {
		runners[i] = &starSystemRunner{
			store:  store,
			system: system,
		}
	}

	return &gameRunnerImpl{
		dispatcher: dispatcher,
		comms:      comms,
		store:      store,

		runners: runners,
		content: content,
	}
}

func (runner *gameRunnerImpl) Run() {
	for _, r := range runner.runners {
		go r.Run()
	}

	runner.dispatcher.RegisterHandler(&worldQueryHandler{
		galaxy: runner.content,
		store:  runner.store,
	})
}

func (runner *gameRunnerImpl) Stop() {
	for _, r := range runner.runners {
		r.Stop()
	}
}
