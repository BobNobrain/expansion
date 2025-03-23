package main

import (
	"context"
	"fmt"
	"srv/internal/components"
	"srv/internal/db"
	"srv/internal/game/worldgen"
	"srv/internal/globals"
	"srv/internal/globals/assets"
	"srv/internal/globals/config"
	"srv/internal/utils/cmdutils"
)

func main() {
	globals.Init()

	store := db.NewDBStorage()
	defer store.Dispose()

	wgen := worldgen.NewWorldGen(config.World().Seed)
	grid := cmdutils.Require(assets.LoadGalacticGrid())

	fmt.Println("Generating galaxy data:")

	galaxySleeves := cmdutils.Require(assets.LoadGalaxySleeves())
	generatedSystems := wgen.GenerateGalaxy(worldgen.GalaxyGeneratorConfig{
		Grid:    grid,
		Sleeves: galaxySleeves.Sleeves,
		// TODO: maybe load from config?
		NStars:            10000,
		MaxStarsDensityAt: 0.05,
	})

	fmt.Printf("  generated %d star systems\n", len(generatedSystems))

	cmdutils.Ensure(store.ClearTable("star_systems"))
	cmdutils.Ensure(store.ClearTable("worlds"))
	cmdutils.Ensure(store.ClearTable("bases"))
	cmdutils.Ensure(store.ClearTable("cities"))
	cmdutils.Ensure(store.ClearTable("celestial_names"))
	cmdutils.Ensure(store.ClearTable("celestial_names_submissions"))

	systemsCreateData := make([]components.CreateGalaxyPayloadSystem, 0, len(generatedSystems))
	for _, generatedSystem := range generatedSystems {
		systemsCreateData = append(systemsCreateData, components.CreateGalaxyPayloadSystem{
			ID:     generatedSystem.SystemID,
			Coords: generatedSystem.Coords,
			Stars:  generatedSystem.Stars,
			Orbits: generatedSystem.Orbits,
		})
	}

	tx := cmdutils.Require(store.StartTransaction(context.Background()))
	defer tx.Rollback()

	cmdutils.Ensure(tx.Systems().CreateGalaxy(components.CreateGalaxyPayload{
		Systems: systemsCreateData,
	}))

	cmdutils.Ensure(tx.Commit())

	fmt.Println("  saved star systems to db")

	starsPerSpectralClass := make(map[string]int)
	for _, char := range "OBAFGKM" {
		starsPerSpectralClass[string(char)] = 0
	}

	for _, system := range generatedSystems {
		for _, star := range system.Stars {
			spectralClass := star.Params.Temperature.GetStarSpectralClass()
			starsPerSpectralClass[spectralClass] += 1
		}
	}
	fmt.Println()

	fmt.Println("  distribution:")
	for spectralClass, count := range starsPerSpectralClass {
		fmt.Printf("    spectral class %s: %d\n", spectralClass, count)
	}
}
