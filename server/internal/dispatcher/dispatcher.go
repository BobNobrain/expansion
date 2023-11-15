package dispatcher

import "srv/internal/domain"

type dispatcherImpl struct {
	handlers map[domain.DispatcherScope]domain.DispatcherCommandHandler
}

func NewDispatcher() domain.Dispatcher {
	return &dispatcherImpl{
		handlers: make(map[domain.DispatcherScope]domain.DispatcherCommandHandler),
	}
}

func (impl *dispatcherImpl) DispatchCommand(cmd *domain.DispatcherCommand) error {
	handler, found := impl.handlers[cmd.Scope]
	if !found {
		return domain.NewUnknownDispatcherScopeError(cmd.Scope)
	}

	return handler.HandleCommand(cmd)
}

func (impl *dispatcherImpl) RegisterHandler(handler domain.DispatcherCommandHandler) {
	impl.handlers[handler.GetScope()] = handler
}
