package main

import (
	"flag"
	"fmt"
	"srv/internal/components"
	"srv/internal/components/auth"
	"srv/internal/db"
	"srv/internal/domain"
	"srv/internal/game/galaxy"
	"srv/internal/globals"
	"srv/internal/globals/assets"
	"srv/internal/globals/config"
	"srv/internal/utils/cmdutils"
	"srv/internal/world/worldgen"
	"srv/internal/world/wsm"
)

func main() {
	mode := flag.String("action", "all", "what to do: all|schema|galaxy|users|test")
	flag.Parse()

	globals.Init()

	store := db.NewDBPermastore()
	cmdutils.Ensure(store.Open())
	defer store.Close()

	auth := auth.NewAuthenticator(store.UserRepo())

	wgen := worldgen.NewWorldGen(config.World().Seed)

	switch *mode {
	case "all":
		all(store, wgen)
	case "schema":
		makeSchema(store)
	case "galaxy":
		generateGalaxy(store, wgen)
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

func makeSchema(store *db.Storage) {
	fmt.Println("Creating db tables")
	cmdutils.Ensure(store.SetupCollections())
	fmt.Println("  done!")
}

func createUsers(store *db.Storage, auth components.Authenticator) {
	fmt.Println("Creating users:")

	userRepo := store.UserRepo()

	users := cmdutils.Require(assets.LoadDevUsers())
	for _, user := range users.Users {
		created := cmdutils.Require(userRepo.Create(components.UserCreateData{
			Username:     domain.Username(user.Username),
			Email:        user.Email,
			PasswordHash: cmdutils.Require(auth.HashPassword(user.Password)),
		}))
		fmt.Printf("  created @%s ('%s')\n", created.Username, created.ID)
	}

	fmt.Printf("  created %d users\n", len(users.Users))
}

func generateGalaxy(store *db.Storage, wgen *worldgen.WorldGen) {
	cmdutils.Ensure(store.PrecalculatedBlobs().Clear())

	fmt.Println("Generating galaxy data:")

	grid := wgen.GenerateGrid(&worldgen.GalacticGridGeneratorOptions{
		NRings:            12,
		MinSectors:        16,
		NSectorsIncrement: 2,
	})

	fmt.Printf("  generated %d sectors\n", grid.Size())

	gridBlob := cmdutils.Require(galaxy.SaveGalacticGrid(grid))
	store.PrecalculatedBlobs().Create(gridBlob)

	fmt.Println("  saved sectors to db")

	galaxySleeves := cmdutils.Require(assets.LoadGalaxySleeves())
	starSystems := wgen.GenerateGalaxy(worldgen.GalaxyGeneratorConfig{
		Grid:    grid,
		Sleeves: galaxySleeves.Sleeves,
		// TODO: maybe load from json?
		NStars:            10000,
		MaxStarsDensityAt: 0.05,
	})

	fmt.Printf("  generated %d star systems\n", len(starSystems))

	starsPerSpectralClass := make(map[string]int)
	for _, char := range "OBAFGKM" {
		starsPerSpectralClass[string(char)] = 0
	}

	cmdutils.Ensure(store.StaticStarSystemData().Clear())

	for _, system := range starSystems {
		state := wsm.NewSystemSharedState(wgen, system.SystemID)
		state.FillFromGeneratedData(&system)
		blob := cmdutils.Require(state.SaveState())
		cmdutils.Ensure(store.StaticStarSystemData().Create(blob))

		for _, star := range system.Stars {
			spectralClass := star.Params.Temperature.GetStarSpectralClass()
			starsPerSpectralClass[spectralClass] += 1
		}
	}

	fmt.Println("  distribution:")
	for spectralClass, count := range starsPerSpectralClass {
		fmt.Printf("    spectral class %s: %d\n", spectralClass, count)
	}

	fmt.Println("  saved star systems to db")
}

func all(store *db.Storage, wgen *worldgen.WorldGen) {
	fmt.Println("Making everything!")
	makeSchema(store)
	generateGalaxy(store, wgen)
}
