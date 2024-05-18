package dispatcher

import (
	"srv/internal/components"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
)

type dispatcherImpl struct {
	handlers     map[components.DispatcherScope]components.DispatcherCommandHandler
	comms        components.Comms
	commandQueue chan *components.DispatcherCommand
}

const maxCommandQueueSize = 512

func NewDispatcher() *dispatcherImpl {
	return &dispatcherImpl{
		handlers:     make(map[components.DispatcherScope]components.DispatcherCommandHandler),
		comms:        nil,
		commandQueue: make(chan *components.DispatcherCommand, maxCommandQueueSize),
	}
}

func (impl *dispatcherImpl) Start(comms components.Comms) {
	impl.comms = comms
	logger.Info(logger.FromMessage("dispatcher", "Dispatcher starting up"))

	go impl.processCommandQueue()
}

func (impl *dispatcherImpl) EnqueueForDispatching(cmd *components.DispatcherCommand) {
	impl.commandQueue <- cmd
}

func (impl *dispatcherImpl) processCommandQueue() {
	for {
		cmd := <-impl.commandQueue

		logger.Debug(
			logger.FromMessage("dispatcher", "Received").
				WithDetail("id", cmd.ID).
				WithDetail("scope", cmd.Scope).
				WithDetail("client", cmd.ClientID).
				WithDetail("command", cmd.Command),
		)
		handler, found := impl.handlers[cmd.Scope]

		var derr common.Error
		var result common.Encodable

		if !found {
			derr = newUnknownDispatcherScopeError(cmd.Scope)
		} else {
			result, derr = handler.HandleCommand(cmd)
		}

		logger.Debug(
			logger.FromMessage("dispatcher", "Responding").
				WithDetail("id", cmd.ID).
				WithDetail("error", derr),
		)
		impl.comms.Respond(components.CommsRespondRequest{
			ClientID:   cmd.ClientID,
			ResponseTo: cmd.ID,
			Error:      derr,
			Result:     result,
		})
	}
}

func (impl *dispatcherImpl) RegisterHandler(handler components.DispatcherCommandHandler) {
	logger.Debug(
		logger.FromMessage("dispatcher", "registered new handler").
			WithDetail("scope", handler.GetScope()),
	)
	impl.handlers[handler.GetScope()] = handler
}
