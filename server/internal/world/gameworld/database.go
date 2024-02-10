package gameworld

import (
	"srv/internal/dispatcher"
	"srv/internal/domain"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

const worldDatabaseScope domain.DispatcherScope = "world"

type worldDatabase struct {
	world *gameWorldImpl
}

func (wdb *worldDatabase) GetScope() domain.DispatcherScope {
	return worldDatabaseScope
}

func (wdb *worldDatabase) HandleCommand(cmd *domain.DispatcherCommand) (common.Encodable, common.Error) {
	switch cmd.Command {
	case "getPlanet":
		return encodables.NewPlanetDataEncodable(wdb.world.testPlanet), nil
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}

func (w *gameWorldImpl) newWorldDatabase() domain.DispatcherCommandHandler {
	return &worldDatabase{world: w}
}
