package main

import (
	"context"
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

	store := db.NewDBStorage()
	defer store.Dispose()

	fmt.Println("Generating fixtures:")

	cmdutils.Ensure(store.ClearTable("users"))
	cmdutils.Ensure(store.ClearTable("roles"))
	cmdutils.Ensure(store.ClearTable("companies"))

	tx := cmdutils.Require(store.StartTransaction(context.Background()))
	defer tx.Rollback()

	userRepo := tx.Users()
	companiesRepo := tx.Companies()
	hasher := auth.NewAuthenticator(userRepo)

	users := cmdutils.Require(assets.LoadDevUsers())
	for _, user := range users.Users {
		created := cmdutils.Require(userRepo.Create(components.UserCreateData{
			Username:     domain.Username(user.Username),
			Email:        user.Email,
			PasswordHash: cmdutils.Require(hasher.HashPassword(user.Password)),
		}))
		fmt.Printf("  created @%s: #%s\n", created.Username, created.ID)

		if user.Org != nil {
			cmdutils.Ensure(companiesRepo.Create(components.CreateCompanyPayload{
				Founder: created.ID,
				Name:    user.Org.Name,
			}))
		}
	}

	cmdutils.Ensure(tx.Commit())

	fmt.Printf("  created %d users\n", len(users.Users))
}
