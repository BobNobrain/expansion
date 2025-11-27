package game

import (
	"srv/internal/utils/phys"
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
