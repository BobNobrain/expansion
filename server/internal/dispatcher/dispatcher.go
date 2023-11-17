package dispatcher

import (
	"fmt"
	"srv/internal/domain"
	"srv/internal/utils/common"
)

type dispatcherImpl struct {
	handlers     map[domain.DispatcherScope]domain.DispatcherCommandHandler
	comms        domain.Comms
	commandQueue chan *domain.DispatcherCommand
}

const maxCommandQueueSize = 512

func NewDispatcher() *dispatcherImpl {
	return &dispatcherImpl{
		handlers:     make(map[domain.DispatcherScope]domain.DispatcherCommandHandler),
		comms:        nil,
		commandQueue: make(chan *domain.DispatcherCommand, maxCommandQueueSize),
	}
}

func (impl *dispatcherImpl) Start(comms domain.Comms) {
	impl.comms = comms

	go impl.processCommandQueue()
}

func (impl *dispatcherImpl) EnqueueForDispatching(cmd *domain.DispatcherCommand) {
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
		impl.comms.Respond(domain.CommsRespondRequest{
			ClientID:   cmd.ClientID,
			ResponseTo: cmd.ID,
			Error:      derr,
			Result:     result,
		})
	}
}

func (impl *dispatcherImpl) RegisterHandler(handler domain.DispatcherCommandHandler) {
	impl.handlers[handler.GetScope()] = handler
}
