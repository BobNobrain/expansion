package domain

import (
	"fmt"
)

type Dispatcher interface {
	DispatchCommand(*DispatcherCommand) error
	RegisterHandler(DispatcherCommandHandler)
}

type DispatcherCommandID uint64

type DispatcherScope string

type DispatcherCommandHandler interface {
	GetScope() DispatcherScope
	HandleCommand(*DispatcherCommand) error
}

type DispatcherCommand struct {
	ID       DispatcherCommandID
	ClientID ClientID
	OnBehalf Username
	Scope    DispatcherScope
	Command  string
	Payload  interface{}
}

type UnknownDispatcherScopeError struct {
	Scope DispatcherScope
}

func (e *UnknownDispatcherScopeError) Error() string {
	return fmt.Sprintf("unknown dispatcher scope: %s", string(e.Scope))
}

func NewUnknownDispatcherScopeError(scope DispatcherScope) error {
	return &UnknownDispatcherScopeError{}
}

type UnknownDispatcherCommandError struct {
	Scope   DispatcherScope
	Command string
}

func (e *UnknownDispatcherCommandError) Error() string {
	return fmt.Sprintf("unknown dispatcher command '%s' for scope '%s'", e.Command, e.Scope)
}

func NewUnknownDispatcherCommandError(dcmd *DispatcherCommand) error {
	return &UnknownDispatcherCommandError{
		Scope:   dcmd.Scope,
		Command: dcmd.Command,
	}
}
