package game

import (
	"fmt"
	"srv/internal/domain"
	"strconv"
	"time"
)

type BaseID int

func (bid BaseID) String() string {
	return strconv.Itoa(int(bid))
}

type BaseOverview struct {
	ID       BaseID
	OwnerID  domain.UserID
	Created  time.Time
	Operator CompanyID
	WorldID  CelestialID
	TileID   TileID
	CityID   CityID

	PrivateInfo *BaseOverviewPrivateInfo
}

type BaseOverviewPrivateInfo struct {
	Name       string
	NFactories int
}

func (b BaseOverview) ViewFor(viewer domain.UserID) *BaseOverview {
	view := b
	if viewer != b.OwnerID {
		view.PrivateInfo = nil
	}
	return &view
}

type Base struct {
	ID       BaseID
	OwnerID  domain.UserID
	Created  time.Time
	Operator CompanyID
	WorldID  CelestialID
	TileID   TileID
	CityID   CityID
	Name     string

	Inventory Inventory
}

func (b *Base) AsStorage() Storage {
	return b
}

func (b *Base) GetStorageID() StorageID {
	return MakeBaseStorageID(b.ID)
}

func (b *Base) GetName() string {
	// TBD: base names
	return fmt.Sprintf("Base at %s", MakeGalacticTileID(b.WorldID, b.TileID).String())
}

func (b *Base) GetInventoryRef() Inventory {
	return b.Inventory
}

func (b *Base) GetDynamicInventoryCopy() DynamicInventory {
	return nil
}

func (b *Base) GetSizeLimit() StorageSize {
	return MakeInfiniteStorageSize()
}
