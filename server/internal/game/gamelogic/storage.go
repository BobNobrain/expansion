package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
)

type StorageLogicImpl struct {
	reg *globaldata.CraftingRegistry
}

var globalStorageLogic *StorageLogicImpl

func StorageLogic() *StorageLogicImpl {
	if globalStorageLogic == nil {
		globalStorageLogic = &StorageLogicImpl{
			reg: globaldata.Crafting(),
		}
	}

	return globalStorageLogic
}
func StorageLogicMocked(reg *globaldata.CraftingRegistry) *StorageLogicImpl {
	return &StorageLogicImpl{
		reg: reg,
	}
}

func (l *StorageLogicImpl) Measure(inventory game.Inventory) game.StorageSize {
	total := game.MakeStorageSize(0, 0)

	for cid, amount := range inventory {
		commodity := l.reg.GetCommodity(cid)
		total = total.Add(commodity.Size.Multiply(amount))
	}

	return total
}

func (l *StorageLogicImpl) AlterStorage(target *Storage, delta game.InventoryDelta) game.StorageAlterResult {
	if len(target.commoditiesWhitelist) != 0 {
		for cid := range delta {
			if !target.commoditiesWhitelist[cid] {
				return game.StorageAlterErrorWrongMaterial
			}
		}
	}

	if !target.content.Add(delta) {
		return game.StorageAlterErrorInsufficient
	}

	newSize := l.Measure(target.content)

	if !newSize.FitsInto(target.sizeLimit) {
		target.content.Remove(delta)
		return game.StorageAlterErrorSizeLimit
	}

	return game.StorageAlterOk
}

type Storage struct {
	content              game.Inventory
	sizeLimit            game.StorageSize
	commoditiesWhitelist map[game.CommodityID]bool
}

type storageContructorOption func(*Storage)

func WithSize(size game.StorageSize) storageContructorOption {
	return func(sl *Storage) {
		sl.sizeLimit = size
	}
}
func WithCommoditiesWhitelist(cids []game.CommodityID) storageContructorOption {
	return func(sl *Storage) {
		sl.commoditiesWhitelist = make(map[game.CommodityID]bool)
		for _, cid := range cids {
			sl.commoditiesWhitelist[cid] = true
		}
	}
}
func WithContent(content game.Inventory) storageContructorOption {
	return func(sl *Storage) {
		sl.content = content
	}
}

func NewStorage(opts ...storageContructorOption) *Storage {
	result := &Storage{}

	for _, opt := range opts {
		opt(result)
	}

	return result
}
