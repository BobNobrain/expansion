package gamestate

import "srv/internal/datafront"

type usersGameState struct {
	onlineUsernames datafront.ReactiveSet[string]
}

func makeUsersGS() *usersGameState {
	onlineUsernames := datafront.NewReactiveSet[string]()
	result := &usersGameState{
		onlineUsernames: onlineUsernames,
	}

	return result
}
