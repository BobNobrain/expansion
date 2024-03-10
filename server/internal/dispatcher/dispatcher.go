package dispatcher

import (
	"fmt"
	"srv/internal/components"
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

	go impl.processCommandQueue()
}

func (impl *dispatcherImpl) EnqueueForDispatching(cmd *components.DispatcherCommand) {
	impl.commandQueue <- cmd
}

func (impl *dispatcherImpl) processCommandQueue() {
	for {
		cmd := <-impl.commandQueue

		fmt.Printf("[dispatcher] next cmd: %v\n", cmd)
		handler, found := impl.handlers[cmd.Scope]

		var derr common.Error
		var result common.Encodable

		if !found {
			derr = newUnknownDispatcherScopeError(cmd.Scope)
		} else {
			result, derr = handler.HandleCommand(cmd)
		}

		fmt.Printf("[dispatcher] responsing: %v / %v\n", result, derr)
		impl.comms.Respond(components.CommsRespondRequest{
			ClientID:   cmd.ClientID,
			ResponseTo: cmd.ID,
			Error:      derr,
			Result:     result,
		})
	}
}

func (impl *dispatcherImpl) RegisterHandler(handler components.DispatcherCommandHandler) {
	impl.handlers[handler.GetScope()] = handler
}
