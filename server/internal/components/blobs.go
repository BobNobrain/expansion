package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type BlobsRepo interface {
	Create(*domain.OpaqueBlob) common.Error
	GetMany([]string) ([]*domain.OpaqueBlob, common.Error)
	Get(string) (*domain.OpaqueBlob, common.Error)
	GetAllOfFormat(string) ([]*domain.OpaqueBlob, common.Error)

	Clear() common.Error
	Update(*domain.OpaqueBlob) common.Error
}
