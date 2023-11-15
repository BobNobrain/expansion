package domain

type Comms interface {
	Broadcast(CommsBroadcastRequest) error
	Respond(CommsRespondRequest) error
}

type CommsBroadcastRequest struct {
	Scope      DispatcherScope
	Event      string
	Recepients []Username
	Payload    interface{}
}

type CommsRespondRequest struct {
	ClientID   ClientID
	ResponseTo DispatcherCommandID
	Error      error
	Result     interface{}
}
