package api

import "encoding/json"

type ClientCommand struct {
	ID      uint64          `json:"id"`
	Scope   string          `json:"scope"`
	Command string          `json:"cmd"`
	Payload json.RawMessage `json:"payload"`
}

type ServerCommandSuccessResponse struct {
	ID     uint64      `json:"id"`
	Result interface{} `json:"result"`
}

type ServerCommandErrorResponse struct {
	ID      uint64      `json:"id"`
	Code    string      `json:"code"`
	Error   string      `json:"error"`
	Details interface{} `json:"details"`
}

type ServerEvent struct {
	Scope   string      `json:"scope"`
	Event   string      `json:"event"`
	Payload interface{} `json:"payload"`
}

type ServerEmptyOkResponse struct {
	Ok bool `json:"ok"`
}

type CommonExtensions struct {
	Debug interface{}       `json:"debug"`
	Names map[string]string `json:"names"`
}
