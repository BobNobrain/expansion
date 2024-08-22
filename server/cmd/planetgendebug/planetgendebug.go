package main

import (
	"fmt"
	"srv/internal/globals"
	"srv/internal/globals/config"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
	"srv/internal/world/planetgen"
	"srv/internal/world/worldgen"
)

func main() {
	globals.Init()

	allWgMats := globaldata.Materials().GetAll().FilterByHasAnyTag("wg")
	protoplanetaryDisk := material.NewMaterialCompound()

	for _, mat := range allWgMats {
		protoplanetaryDisk.Add(mat, mat.GetAbundance(0.5))
	}

	planet := planetgen.GeneratePlanet(planetgen.GeneratePlanetOptions{
		WR: *worldgen.NewWorldRandom(config.World().Seed),
		ID: world.CreatePlanetID(world.CelestialID("AA-001"), 1),
		Params: world.CelestialBodyParams{
			Radius: phys.Kilometers(6400),
			Mass:   phys.EarthMasses(1),
			Class:  world.CelestialBodyClassTerrestial,
		},
		StarParams: world.StarParams{
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
