package main

import (
	"fmt"
	"srv/internal/game"
	"srv/internal/game/planetgen"
	"srv/internal/game/worldgen"
	"srv/internal/globals"
	"srv/internal/globals/config"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

func main() {
	globals.Init()

	allWgMats := globaldata.Materials().GetAll().FilterByHasAnyTag("wg")
	protoplanetaryDisk := material.NewMaterialCompound()

	for _, mat := range allWgMats {
		protoplanetaryDisk.Add(mat, mat.GetAbundance(0.5)*mat.GetMolarMass())
	}

	planet := planetgen.GeneratePlanet(planetgen.GeneratePlanetOptions{
		WR: worldgen.NewWorldRandom(config.World().Seed),
		ID: game.CreatePlanetID(game.CelestialID("AA-001"), 1),
		Params: game.WorldParams{
			Radius: phys.Kilometers(6400),
			Mass:   phys.EarthMasses(1),
			Class:  game.CelestialBodyClassTerrestial,
		},
		StarParams: game.StarParams{
			Temperature: phys.Kelvins(5600),
			Luminosity:  phys.LuminositySuns(1),
			Mass:        phys.SolarMasses(1),
			Radius:      phys.AstronomicalUnits(0.00465047),
		},
		StarDistance:       phys.AstronomicalUnits(1),
		AvailableMaterials: protoplanetaryDisk,
	})

	fmt.Printf("Planet: %+v\n", planet)
}
