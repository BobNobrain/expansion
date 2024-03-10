package components

import (
	"srv/internal/config"
	"srv/internal/domain"
)

type Permastore interface {
	Open(cfg *config.SrvConfig) error
	Close() error

	SetupCollections() error

	UserRepo() domain.UserRepo
	OrgRepo() domain.OrgRepo
	CelestialRepo() domain.CelestialBodiesRepo
	GalacticSectorsRepo() domain.GalacticSectorsRepo
}
