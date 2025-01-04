package dispatcher

import (
	"encoding/json"
	"srv/internal/components"
	"srv/internal/utils/common"
)

func DecodeJSONCmdPayload[T any](cmd *components.DispatcherCommand) (T, common.Error) {
	var payload T
	err := json.Unmarshal(cmd.Payload, &payload)
	if err != nil {
		return payload, common.NewWrapperError("ERR_DECODE", err)
	}

	return payload, nil
}

type handlerFunc = func(*components.DispatcherCommand) (common.Encodable, common.Error)

type DispatcherHandlerBuilder interface {
	components.DispatcherCommandHandler
	AddHandler(string, handlerFunc)
}

type dispatcherHandlerBuilderImpl struct {
	scope    components.DispatcherScope
	handlers map[string]handlerFunc
}

func NewDispatcherHandlerBuilder(scope components.DispatcherScope) DispatcherHandlerBuilder {
	return &dispatcherHandlerBuilderImpl{
		scope:    scope,
		handlers: make(map[string]handlerFunc),
	}
}

func (b *dispatcherHandlerBuilderImpl) AddHandler(command string, handler handlerFunc) {
	b.handlers[command] = handler
}

func (b *dispatcherHandlerBuilderImpl) GetScope() components.DispatcherScope {
	return b.scope
}

func (b *dispatcherHandlerBuilderImpl) HandleCommand(cmd *components.DispatcherCommand) (common.Encodable, common.Error) {
	handler, found := b.handlers[cmd.Command]
	if !found {
		return nil, NewUnknownDispatcherCommandError(cmd)
	}

	return handler(cmd)
}
