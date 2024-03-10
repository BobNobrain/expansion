package dispatcher

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/encodables"
	"srv/internal/utils/common"
)

type unknownDispatcherScopeError struct {
	Scope components.DispatcherScope
}

func (e *unknownDispatcherScopeError) Error() string {
	return fmt.Sprintf("unknown dispatcher scope: '%s'", string(e.Scope))
}
func (e *unknownDispatcherScopeError) Code() string {
	return "ERR_UNKNOWN_SCOPE"
}
func (e *unknownDispatcherScopeError) Details() common.Encodable {
	return encodables.NewDebugEncodable().Add("scope", e.Scope)
}

func newUnknownDispatcherScopeError(scope components.DispatcherScope) common.Error {
	return &unknownDispatcherScopeError{
		Scope: scope,
	}
}

type UnknownDispatcherCommandError struct {
	Scope   components.DispatcherScope
	Command string
}

func (e *UnknownDispatcherCommandError) Error() string {
	return fmt.Sprintf("unknown dispatcher command '%s' for scope '%s'", e.Command, e.Scope)
}
func (e *UnknownDispatcherCommandError) Code() string {
	return "ERR_UNKNOWN_COMMAND"
}
func (e *UnknownDispatcherCommandError) Details() common.Encodable {
	return encodables.NewDebugEncodable().Add("scope", e.Scope).Add("command", e.Command)
}

func NewUnknownDispatcherCommandError(dcmd *components.DispatcherCommand) common.Error {
	return &UnknownDispatcherCommandError{
		Scope:   dcmd.Scope,
		Command: dcmd.Command,
	}
}
