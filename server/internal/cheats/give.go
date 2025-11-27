package cheats

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type giveCheatImpl struct{}

func newGiveCheat() Cheat {
	return &giveCheatImpl{}
}

func (g *giveCheatImpl) Run(
	cmd cheatCommand,
	repos components.StorageRepos,
	context components.UsecaseContext,
) (common.Encodable, common.Error) {
	baseID := game.BaseID(cmd.GetNextArg("base", "baseId").Int())
	inv := game.MakeInventoryDeltaFrom(cmd.GetNextArg("inv", "items").Inventory())

	base, err := repos.Bases().GetBase(baseID)
	if err != nil {
		return nil, err
	}

	base.Inventory.Add(inv)

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{
		BaseID: base.ID,
		Base:   base,
	})

	return common.EmptyEncodable(), nil
}
