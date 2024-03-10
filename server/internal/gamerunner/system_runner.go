package gamerunner

import (
	"srv/internal/components"
	"srv/internal/domain"
)

type starSystemRunner struct {
	store  components.Permastore
	system *domain.StarSystem
}

func (runner *starSystemRunner) Run() {
	// TODO: update orbits, save the state, etc.
}

func (runner *starSystemRunner) Stop() {}
