package api

import "srv/internal/domain"

type ClientCommand struct {
	ID      domain.DispatcherCommandID `json:"id"`
	Scope   domain.DispatcherScope     `json:"scope"`
	Command string                     `json:"cmd"`
	Payload interface{}                `json:"payload"`
}

type ServerCommandSuccessResponse struct {
	ID     domain.DispatcherCommandID `json:"id"`
	Result interface{}                `json:"result"`
}

type ServerCommandErrorResponse struct {
	ID      domain.DispatcherCommandID `json:"id"`
	Code    string                     `json:"code"`
	Error   string                     `json:"error"`
	Details interface{}                `json:"details"`
}

type ServerEvent struct {
	Scope   domain.DispatcherScope `json:"scope"`
	Event   string                 `json:"event"`
	Payload interface{}            `json:"payload"`
}
