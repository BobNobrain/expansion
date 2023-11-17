package encodables

import "srv/pkg/api"

type EmptyOkResponse struct{}

func NewEmptyOkResponse() *EmptyOkResponse {
	return &EmptyOkResponse{}
}

func (*EmptyOkResponse) Encode() interface{} {
	return &api.ServerEmptyOkResponse{
		Ok: true,
	}
}

type customDetails struct {
	details map[string]interface{}
}

func NewDebugEncodable() *customDetails {
	return &customDetails{
		details: make(map[string]interface{}),
	}
}

func (c *customDetails) Add(prop string, value interface{}) *customDetails {
	c.details[prop] = value
	return c
}

func (c *customDetails) Encode() interface{} {
	return c.details
}
