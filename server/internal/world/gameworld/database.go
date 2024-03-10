package gameworld

import (
	"srv/internal/components"
	"srv/internal/dispatcher"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

const worldDatabaseScope components.DispatcherScope = "world"

type worldDatabase struct {
	world *gameWorldImpl
}

func (wdb *worldDatabase) GetScope() components.DispatcherScope {
	return worldDatabaseScope
}

func (wdb *worldDatabase) HandleCommand(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	switch cmd.Command {
	case "getPlanet":
		return encodables.NewPlanetDataEncodable(wdb.world.testPlanet), nil
	}

	return nil, dispatcher.NewUnknownDispatcherCommandError(cmd)
}

func (w *gameWorldImpl) newWorldDatabase() components.DispatcherCommandHandler {
	return &worldDatabase{world: w}
}
