package main

import (
	"flag"
	"fmt"
	"math"
	"srv/internal/assets"
	"srv/internal/auth"
	"srv/internal/components"
	"srv/internal/config"
	"srv/internal/db"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/cmdutils"
	"srv/internal/world/worldgen"
)

func main() {
	mode := flag.String("action", "all", "what to do: all|schema|galaxy|users|test")
	flag.Parse()

	cfg := cmdutils.Require(config.Get())

	cmdutils.Require(assets.Configure(cfg.AssetDir))

	store := db.NewDBPermastore()
	cmdutils.Ensure(store.Open(cfg))
	defer store.Close()

	auth := auth.NewAuthenticator(store.UserRepo(), cfg)

	switch *mode {
	case "all":
		all(store, cfg)
	case "schema":
		makeSchema(store)
	case "galaxy":
		generateGalaxy(store, cfg)
	case "users":
		createUsers(store, auth)
	case "test":
		testConnection()

	default:
		fmt.Printf("unknown action: '%s'\n", *mode)
	}
}

func testConnection() {
	// store is opened before everything anyway
	fmt.Println("connection is ok!")
}

func makeSchema(store components.Permastore) {
	fmt.Println("Creating db tables")
	cmdutils.Ensure(store.SetupCollections())
	fmt.Println("  done!")
}

func createUsers(store components.Permastore, auth components.Authenticator) {
	fmt.Println("Creating users:")

	userRepo := store.UserRepo()

	users := cmdutils.Require(assets.GetAssetLoader().LoadDevUsers())
	for _, user := range users.Users {
		created := cmdutils.Require(userRepo.CreateUser(domain.UserCreateData{
			Username:     domain.Username(user.Username),
			Email:        "",
			PasswordHash: cmdutils.Require(auth.HashPassword(user.Password)),
		}))
		fmt.Printf("  created @%s ('%s')\n", created.Username, created.ID)
	}

	fmt.Printf("  created %d users\n", len(users.Users))
}

func generateGalaxy(store components.Permastore, cfg *config.SrvConfig) {
	fmt.Println("Generating galaxy data:")

	rnd := utils.GetSeededRandom(cfg.WorldSeed)
	grid := worldgen.GenerateGalacticGrid(&worldgen.GalacticGridGeneratorOptions{
		Rnd:               rnd,
		NRings:            12,
		MinSectors:        16,
		NSectorsIncrement: 2,
	})

	fmt.Printf("  generated %d sectors\n", grid.Size())

	gridRepo := store.GalacticSectorsRepo()
	for _, sector := range grid.GetSectors() {
		cmdutils.Ensure(gridRepo.Create(sector))
	}

	fmt.Println("  saved sectors to db")

	fullCircle := math.Pi * 2
	starSystems := worldgen.GenerateGalaxyStars(worldgen.GalaxyGeneratorConfig{
		Rnd:    rnd,
		Grid:   grid,
		NStars: 10000,
		// TODO: maybe load from json?
		Sleeves: []*worldgen.GalaxyGeneratorConfigSleeve{
			{
				Position:        0,
				Width:           fullCircle / 7,
				StarsPercentage: 0.15,
				Twist:           3.1,
			},
			{
				Position:        0.19,
				Width:           fullCircle / 7,
				StarsPercentage: 0.1,
				Twist:           2.9,
			},
			{
				Position:        0.37,
				Width:           fullCircle / 7,
				StarsPercentage: 0.1,
				Twist:           3,
			},
			{
				Position:        0.54,
				Width:           fullCircle / 10,
				StarsPercentage: 0.05,
				Twist:           2.8,
			},
			{
				Position:        0.7,
				Width:           fullCircle / 7,
				StarsPercentage: 0.1,
				Twist:           3.1,
			},
			{
				Position:        0.87,
				Width:           fullCircle / 100,
				StarsPercentage: 0.01,
				Twist:           3,
			},
		},
		MaxStarsDensityAt: 0.05,
	})

	fmt.Printf("  generated %d star systems\n", len(starSystems))

	celstialsRepo := store.CelestialRepo()
	for _, system := range starSystems {
		cmdutils.Ensure(celstialsRepo.Create(system))
	}

	fmt.Println("  saved star systems to db")
}

func all(store components.Permastore, cfg *config.SrvConfig) {
	fmt.Println("Making everything!")
	makeSchema(store)
	generateGalaxy(store, cfg)
}
