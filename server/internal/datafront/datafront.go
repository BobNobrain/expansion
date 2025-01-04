package datafront

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type ReactiveDataListener interface {
	NotifyUpdated()
}

type ReactiveData interface {
	GetValue() common.Encodable

	Listen(ReactiveDataListener)
	Unlisten(ReactiveDataListener)

	Subscribe(domain.ClientID)
	Unsubscribe(domain.ClientID)

	Attach(*DataFront, DFPath)
	Dispose()
}

type ReactiveTable interface {
	Query(DFRequest) common.Encodable
	Attach(*DataFront, DFPath)
	Dispose()
}

// type DataFront interface {
// 	CreateSubtree(DFPath)
// 	RemoveSubtree(DFPath) common.Error
// 	RemoveValue(DFPath) common.Error

// 	Dispose()
// }
