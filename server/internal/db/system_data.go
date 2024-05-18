package db

// import (
// 	"encoding/json"
// 	"srv/internal/domain"
// 	"srv/internal/utils/geom"
// 	"srv/internal/utils/phys"
// )

// type starSystemJSONData struct {
// 	IsExplored bool                       `json:"exp"`
// 	Stars      []starSystemJSONDataStar   `json:"stars"`
// 	Planets    []starSystemJSONDataPlanet `json:"planets"`
// 	Bodies     []starSystemJSONDataBody   `json:"bodies"`
// 	// Asteroids []starSystemJSONDataAsteroid `json:"asteroids"`
// }

// type starSystemJSONDataStar struct {
// 	StarID string `json:"starId"`

// 	TempK          float64 `json:"temp"`
// 	LuminositySuns float64 `json:"lum"`
// 	RadiusAu       float64 `json:"r"`
// 	MassSuns       float64 `json:"m"`
// 	AgeByrs        float64 `json:"age"`
// }

// type starSystemJSONDataPlanet struct {
// 	PlanetID string `json:"planetId"`
// }

// type starSystemJSONDataBody struct {
// 	ID    string                  `json:"bodyId"`
// 	Orbit starSystemJSONDataOrbit `json:"orbit"`
// }

// type starSystemJSONDataOrbit struct {
// 	Around       *string `json:"around"`
// 	SemiMajorAu  float64 `json:"smaj"`
// 	SemiMinorAu  float64 `json:"smin"`
// 	XRotationRad float64 `json:"xrot"`
// 	YRotationRad float64 `json:"yrot"`
// 	ZRotationRad float64 `json:"zrot"`
// 	Theta0       float64 `json:"th0"`
// }

// func encodeSystemToJSON(system *domain.StarSystem) string {
// 	data := &starSystemJSONData{
// 		IsExplored: system.IsExplored,
// 		Stars:      make([]starSystemJSONDataStar, len(system.Stars)),
// 		Planets:    make([]starSystemJSONDataPlanet, len(system.Planets)),
// 		Bodies:     make([]starSystemJSONDataBody, len(system.Bodies)),
// 	}

// 	for i, star := range system.Stars {
// 		data.Stars[i] = starSystemJSONDataStar{
// 			StarID:         string(star.StarID),
// 			TempK:          star.StarData.Temperature.Kelvins(),
// 			LuminositySuns: star.StarData.Luminosity.Suns(),
// 			RadiusAu:       star.StarData.Radius.AstronomicalUnits(),
// 			MassSuns:       star.StarData.Mass.SolarMasses(),
// 			AgeByrs:        star.StarData.Age.BillionYears(),
// 		}
// 	}

// 	for i, planet := range system.Planets {
// 		data.Planets[i] = starSystemJSONDataPlanet{
// 			PlanetID: string(planet.PlanetID),
// 		}
// 	}

// 	i := 0
// 	for _, body := range system.Bodies {
// 		data.Bodies[i] = starSystemJSONDataBody{
// 			ID: string(body.ID),
// 			Orbit: starSystemJSONDataOrbit{
// 				Around:       (*string)(body.Orbit.Center),
// 				SemiMajorAu:  body.Orbit.Ellipse.SemiMajor.AstronomicalUnits(),
// 				SemiMinorAu:  body.Orbit.Ellipse.SemiMinorAxis.AstronomicalUnits(),
// 				XRotationRad: body.Orbit.XRotation.Radians(),
// 				YRotationRad: body.Orbit.YRotation.Radians(),
// 				ZRotationRad: body.Orbit.ZRotation.Radians(),
// 				Theta0:       body.Orbit.Theta0.Radians(),
// 			},
// 		}
// 	}

// 	str, _ := json.Marshal(data) // should be ok
// 	return string(str)
// }

// func decodeSystemFromJSON(serialized string, into *domain.StarSystem) error {
// 	data := &starSystemJSONData{}
// 	err := json.Unmarshal([]byte(serialized), data)
// 	if err != nil {
// 		return err
// 	}

// 	into.IsExplored = data.IsExplored
// 	into.Stars = make([]*domain.Star, len(data.Stars))
// 	into.Planets = make([]*domain.Planet, len(data.Planets))
// 	into.Bodies = make(map[domain.CelestialID]*domain.CelestialBody)

// 	for i, starData := range data.Stars {
// 		into.Stars[i] = &domain.Star{
// 			StarID: domain.CelestialID(starData.StarID),
// 			StarData: domain.StarData{
// 				Temperature: phys.Kelvins(starData.TempK),
// 				Luminosity:  phys.LuminositySuns(starData.LuminositySuns),
// 				Mass:        phys.SolarMasses(starData.MassSuns),
// 				Radius:      phys.AstronomicalUnits(starData.RadiusAu),
// 				Age:         phys.BillionYears(starData.AgeByrs),
// 			},
// 		}
// 	}

// 	for i, planetData := range data.Planets {
// 		into.Planets[i] = &domain.Planet{
// 			PlanetID: domain.CelestialID(planetData.PlanetID),
// 		}
// 	}

// 	for _, bodyData := range data.Bodies {
// 		bodyId := domain.CelestialID(bodyData.ID)
// 		into.Bodies[bodyId] = &domain.CelestialBody{
// 			ID: bodyId,
// 			Orbit: domain.OrbitData{
// 				Center: (*domain.CelestialID)(bodyData.Orbit.Around),
// 				Ellipse: phys.EllipticOrbit{
// 					SemiMajor:     phys.AstronomicalUnits(bodyData.Orbit.SemiMajorAu),
// 					SemiMinorAxis: phys.AstronomicalUnits(bodyData.Orbit.SemiMinorAu),
// 				},
// 				XRotation: geom.Radians(bodyData.Orbit.XRotationRad),
// 				YRotation: geom.Radians(bodyData.Orbit.YRotationRad),
// 				ZRotation: geom.Radians(bodyData.Orbit.ZRotationRad),
// 				Theta0:    geom.Radians(bodyData.Orbit.Theta0),
// 			},
// 		}
// 	}

// 	return nil
// }
