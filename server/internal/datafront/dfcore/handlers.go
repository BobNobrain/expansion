package dfcore

import (
	"encoding/json"
	"srv/internal/components"
	"srv/internal/utils/common"
	"srv/pkg/dfapi"
)

func (df *DataFront) HandleRequest(rq components.DataFrontRequest) (common.Encodable, common.Error) {
	switch rq.Type {
	case "table":
		return df.handleTableQuery(rq)

	case "-table":
		return nil, df.handleTableUnsubscribe(rq)

	case "singleton":
		return df.handleSingletonQuery(rq)

	case "-singleton":
		return nil, df.handleSingletonUnsubscribe(rq)

	case "log":
		// TODO
		panic("not implemented")

	case "-log":
		// TODO
		panic("not implemented")

	case "action":
		// TODO
		return df.handleAction(rq)

	default:
		return nil, common.NewValidationError("DataFrontRequest::Type", "unknown DataFront request type: "+rq.Type)
	}
}

func (df *DataFront) handleTableQuery(rq components.DataFrontRequest) (common.Encodable, common.Error) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := decodeJSONPayload[dfapi.DFTableRequest](rq)
	if err != nil {
		return nil, err
	}

	q, found := df.tables[DFPath(query.Path)]
	if !found {
		return nil, common.NewValidationError("DFTableRequest::Path", "table path does not exist")
	}

	result, err := q.Query(query, MakeDFRequestContext(rq))
	if err != nil {
		return nil, err
	}

	return common.AsEncodable(result), nil
}

func (df *DataFront) handleTableUnsubscribe(rq components.DataFrontRequest) common.Error {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := decodeJSONPayload[dfapi.DFTableUnsubscribeRequest](rq)
	if err != nil {
		return err
	}

	q, found := df.tables[DFPath(query.Path)]
	if !found {
		return common.NewValidationError("DFTableRequest::Path", "table path does not exist")
	}

	q.UnsubscribeFromIDs(query, rq.ClientID)

	return nil
}

func (df *DataFront) handleSingletonQuery(rq components.DataFrontRequest) (common.Encodable, common.Error) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := decodeJSONPayload[dfapi.DFSingletonRequest](rq)
	if err != nil {
		return nil, err
	}

	singleton, found := df.singletons[DFPath(query.Path)]
	if !found {
		return nil, common.NewValidationError("DFSingletonRequest::Path", "singleton path does not exist")
	}

	result, err := singleton.Query(query, MakeDFRequestContext(rq))
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (df *DataFront) handleSingletonUnsubscribe(rq components.DataFrontRequest) common.Error {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := decodeJSONPayload[dfapi.DFSingletonUnsubscribeRequest](rq)
	if err != nil {
		return err
	}

	singleton, found := df.singletons[DFPath(query.Path)]
	if !found {
		return common.NewValidationError("DFSingletonRequest::Path", "singleton path does not exist")
	}

	singleton.Unsubscribe(rq.ClientID)
	return nil
}

func (df *DataFront) handleAction(rq components.DataFrontRequest) (common.Encodable, common.Error) {
	df.lock.RLock()
	defer df.lock.RUnlock()

	query, err := decodeJSONPayload[dfapi.DFActionRequest](rq)
	if err != nil {
		return nil, err
	}

	action, found := df.actions[DFPath(query.Name)]
	if !found {
		return nil, common.NewValidationError("DFActionRequest::Name", "action name does not exist")
	}

	result, err := action.Run(query, rq.OnBehalf)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func decodeJSONPayload[T any](rq components.DataFrontRequest) (T, common.Error) {
	var result T
	err := json.Unmarshal(rq.Request, &result)
	if err != nil {
		return result, common.NewDecodingError(err)
	}
	return result, nil
}
