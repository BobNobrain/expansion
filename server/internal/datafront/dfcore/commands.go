package dfcore

import (
	"srv/internal/components"
	"srv/internal/components/dispatcher"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
)

func (df *DataFront) handleTableQuery(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := dispatcher.DecodeJSONCmdPayload[dfapi.DFTableRequest](cmd)
	if err != nil {
		return nil, err
	}

	q, found := df.tables[DFPath(query.Path)]
	if !found {
		return nil, newPathNotFoundError(DFPath(query.Path))
	}

	result, err := q.Query(query, cmd.ClientID)
	if err != nil {
		return nil, err
	}

	return &dfapi.DFTableResponse{
		Values: result,
	}, nil
}

func (df *DataFront) handleSingletonQuery(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := dispatcher.DecodeJSONCmdPayload[dfapi.DFSingletonRequest](cmd)
	if err != nil {
		return nil, err
	}

	singleton, found := df.singletons[DFPath(query.Path)]
	if !found {
		return nil, newPathNotFoundError(DFPath(query.Path))
	}

	result, err := singleton.Query(query, cmd.ClientID)
	if err != nil {
		return nil, err
	}

	return &dfapi.DFSingletonResponse{
		Value: result,
	}, nil
}
