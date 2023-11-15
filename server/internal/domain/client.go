package domain

import "math/rand"

type ClientID uint64

func NewClientID() ClientID {
	return ClientID(rand.Uint64())
}
