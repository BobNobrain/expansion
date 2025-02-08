package main

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/components/auth"
	"srv/internal/db"
	"srv/internal/domain"
	"srv/internal/globals"
	"srv/internal/globals/assets"
	"srv/internal/utils/cmdutils"
)

func main() {
	globals.Init()

	store := db.NewDBPermastore()
	defer store.Dispose()

	fmt.Println("Generating fixtures:")

	userRepo := store.UserRepo()
	hasher := auth.NewAuthenticator(store.UserRepo())

	cmdutils.Ensure(store.ClearTable("users"))
	cmdutils.Ensure(store.ClearTable("roles"))
	cmdutils.Ensure(store.ClearTable("companies"))

	users := cmdutils.Require(assets.LoadDevUsers())
	for _, user := range users.Users {
		created := cmdutils.Require(userRepo.Create(components.UserCreateData{
			Username:     domain.Username(user.Username),
			Email:        user.Email,
			PasswordHash: cmdutils.Require(hasher.HashPassword(user.Password)),
		}))
		fmt.Printf("  created @%s: #%s\n", created.Username, created.ID)
	}

	fmt.Printf("  created %d users\n", len(users.Users))
}
