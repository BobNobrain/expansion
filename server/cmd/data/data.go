package main

import (
	"fmt"
	"srv/internal/assets"
	"srv/internal/config"
	"srv/internal/db"
	"srv/internal/domain"
)

func main() {
	cfg, err := config.Get()
	if err != nil {
		panic(err)
	}

	assets.Configure(cfg.AssetDir)

	store := db.NewDBPermastore()
	store.Open(cfg)

	users := store.UserRepo()
	// orgs := store.OrgRepo()

	devData, err := assets.GetAssetLoader().LoadDevUsers()
	if err != nil {
		panic(err)
	}

	for _, userData := range devData.Users {
		usr, err := users.CreateUser(domain.UserCreateData{
			Username:     domain.Username(userData.Username),
			PasswordHash: userData.Password,
		})

		if err != nil {
			panic(err)
		}

		fmt.Printf("+user %s:%s (%s)\n", usr.Username, userData.Password, usr.ID)
	}

	fmt.Println("done.")
}
