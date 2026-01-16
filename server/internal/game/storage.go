package game

import (
	"fmt"
	"srv/internal/utils/common"
	"srv/internal/utils/phys"
	"strconv"
)

type StorageAlterResult byte

const (
	StorageAlterOk StorageAlterResult = iota
	StorageAlterErrorInsufficient
	StorageAlterErrorSizeLimit
	StorageAlterErrorWrongMaterial
)

func (r StorageAlterResult) IsOk() bool {
	return r == StorageAlterOk
}
func (r StorageAlterResult) IsLimitReached() bool {
	return r == StorageAlterErrorSizeLimit
}
func (r StorageAlterResult) IsNotEnoughMaterials() bool {
	return r == StorageAlterErrorInsufficient
}

func (r StorageAlterResult) String() string {
	switch r {
	case StorageAlterOk:
		return "ok"
	case StorageAlterErrorInsufficient:
		return "notEnough"
	case StorageAlterErrorSizeLimit:
		return "sizeLimit"
	case StorageAlterErrorWrongMaterial:
		return "wrongMaterial"
	default:
		return "unknown"
	}
}

// TODO: decide if should use ints instead to avoid precision errors
type StorageSize struct {
	mass   float64
	volume float64
}

func MakeStorageSize(kg, m3 float64) StorageSize {
	return StorageSize{mass: kg, volume: m3}
}
func MakeInfiniteStorageSize() StorageSize {
	return StorageSize{mass: 0, volume: 0}
}

func (s StorageSize) GetMass() phys.Mass {
	return phys.Kilograms(s.mass)
}
func (s StorageSize) GetVolume() phys.Volume {
	return phys.CubicMeters(s.volume)
}

func (s StorageSize) IsFiniteMass() bool {
	return s.mass != 0
}
func (s StorageSize) IsFiniteVolume() bool {
	return s.volume != 0
}

func (s1 StorageSize) Add(s2 StorageSize) StorageSize {
	return StorageSize{
		mass:   s1.mass + s2.mass,
		volume: s1.volume + s2.volume,
	}
}
func (s StorageSize) Multiply(factor float64) StorageSize {
	return StorageSize{
		mass:   s.mass * factor,
		volume: s.volume * factor,
	}
}
func (s StorageSize) FitsInto(limit StorageSize) bool {
	massFits := !limit.IsFiniteMass() || limit.mass >= s.mass
	volumeFits := !limit.IsFiniteVolume() || limit.volume >= s.volume
	return massFits && volumeFits
}

type StorageID string

func (sid StorageID) IsBase() bool {
	return sid[0] == 'b'
}
func (sid StorageID) IsFactory() bool {
	return sid[0] == 'f'
}
func (sid StorageID) IsValid() bool {
	return len(sid) > 0
}

func ParseStorageID(value string) (StorageID, common.Error) {
	switch value[0] {
	case 'b', 'f':
		_, err := strconv.Atoi(value[1:])
		if err != nil {
			return "", common.NewValidationError("StorageID", "Invalid storage ID", common.WithDetail("value", value))
		}

		return StorageID(value), nil

	default:
		return "", common.NewValidationError("StorageID", "Invalid storage ID", common.WithDetail("value", value))
	}
}

func (sid StorageID) GetBaseID() BaseID {
	bid, _ := strconv.Atoi(string(sid[1:]))
	return BaseID(bid)
}
func (sid StorageID) GetFactoryID() FactoryID {
	fid, _ := strconv.Atoi(string(sid[1:]))
	return FactoryID(fid)
}

func MakeBaseStorageID(bid BaseID) StorageID {
	return StorageID(fmt.Sprintf("b%d", bid))
}
func MakeFactoryStorageID(fid FactoryID) StorageID {
	return StorageID(fmt.Sprintf("b%d", fid))
}

type Storage interface {
	GetStorageID() StorageID
	GetName() string
	GetInventoryRef() Inventory
	GetDynamicInventoryCopy() DynamicInventory
	GetSizeLimit() StorageSize
}

func UnwrapStorageAsBase(s Storage) *Base {
	return s.(*Base)
}
func UnwrapStorageAsFactory(s Storage) *Factory {
	return s.(*Factory)
}

// type Storage struct {
// 	ID             StorageID
// 	Name           string
// 	StaticContent  Inventory
// 	DynamicContent DynamicInventory
// 	SizeLimit      StorageSize
// }

// func MakeStorageForBase(b Base) Storage {
// 	return Storage{
// 		ID: MakeBaseStorageID(b.ID),
// 		// TODO: base name
// 		Name:           fmt.Sprintf("Base at %s", MakeGalacticTileID(b.WorldID, b.TileID).String()),
// 		StaticContent:  b.Inventory,
// 		DynamicContent: nil,
// 		// TODO: base storage limits
// 		SizeLimit: MakeInfiniteStorageSize(),
// 	}
// }

// func MakeStorageForFactory(f Factory) Storage {
// 	return Storage{
// 		ID: MakeFactoryStorageID(f.FactoryID),
// 		// TODO: factory names
// 		Name:           fmt.Sprintf("Factory %d", f.FactoryID),
// 		StaticContent:  MakeEmptyInventory(),
// 		DynamicContent: f.Production.GetDynamicInventory(),
// 		// TODO: factory storage limits
// 		SizeLimit: MakeInfiniteStorageSize(),
// 	}
// }
