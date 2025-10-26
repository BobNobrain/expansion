package gamelogic

// import (
// 	"srv/internal/game"
// 	"srv/internal/globals/globaldata"
// 	"srv/internal/utils/common"
// 	"time"
// )

// type BaseUpdatesLogic struct {
// 	baseData *game.BaseData
// 	reg      *globaldata.CraftingRegistry

// 	speeds map[game.CommodityID]float64
// }

// type baseUpdatePoint struct {
// 	deltaHours float64
// 	t          time.Time
// }

// func NewBaseUpdatesLogic(baseData *game.BaseData) *BaseUpdatesLogic {
// 	return &BaseUpdatesLogic{
// 		baseData: baseData,
// 		reg:      globaldata.Crafting(),
// 	}
// }

// func (l *BaseUpdatesLogic) MockRegistry(reg *globaldata.CraftingRegistry) {
// 	l.reg = reg
// }

// // TODO: add logic to validate (and fix?) base state

// // Calculates productivity coeff of given equipment piece based on what jobs are filled
// func (l *BaseUpdatesLogic) CalcEquipmentWorkforceProductivity(b game.BaseEquipment) float64 {
// 	eq := l.reg.GetEquipment(b.EquipmentID)

// 	required := 0.0
// 	filled := 0.0
// 	for wf, jobs := range eq.Jobs {
// 		required += float64(jobs.Count*b.Count) * jobs.Contribution
// 		filled += float64(min(b.Workers[wf], jobs.Count*b.Count)) * jobs.Contribution
// 	}

// 	if required == 0.0 {
// 		return 0.0
// 	}

// 	return filled / required
// }
// func (l *BaseUpdatesLogic) calcEquipmentProductivities() map[game.EquipmentID]float64 {
// 	result := make(map[game.EquipmentID]float64)
// 	for eqid, eq := range l.baseData.Equipment {
// 		result[eqid] = l.CalcEquipmentWorkforceProductivity(eq)
// 	}
// 	return result
// }

// func (l *BaseUpdatesLogic) Update(now time.Time) {
// 	for range 141 {
// 		l.calcInventoryChangeSpeeds()
// 		nextUpdate := l.calcNextUpdate()

// 		// logger.Info(logger.FromMessage("gamelogic", "update").WithDetail("speeds", l.speeds).WithDetail("nextUpdate", nextUpdate))

// 		if now.Sub(l.baseData.Updated).Hours() < nextUpdate.deltaHours {
// 			return
// 		}

// 		l.adjustInventoryToNextPoint(nextUpdate.deltaHours)
// 		l.haltProductionAfterUpdate(nextUpdate)

// 		l.baseData.Updated = nextUpdate.t
// 		// logger.Info(logger.FromMessage("gamelogic", "updated").WithDetail("datetime", l.baseData.Updated))
// 	}

// 	panic("ProductionLogic::Update() took too much iterations, something went wrong")
// }

// func (l *BaseUpdatesLogic) InsertManualPoint(at time.Time) {
// 	deltaHours := at.Sub(l.baseData.Updated).Hours()
// 	if deltaHours < 0.0 {
// 		panic("cannot InsertManualPoint in the past")
// 	}
// 	if deltaHours == 0.0 {
// 		// it's already on that time
// 		return
// 	}

// 	nextUpdate := l.calcNextUpdate()
// 	if nextUpdate.deltaHours < deltaHours {
// 		panic("should have base state updated first")
// 	}

// 	l.baseData.Inventory = l.SampleInventory(at)
// 	l.baseData.Updated = at
// }

// func (l *BaseUpdatesLogic) SampleInventory(at time.Time) map[game.CommodityID]float64 {
// 	l.calcInventoryChangeSpeeds()
// 	deltaHours := at.Sub(l.baseData.Updated).Hours()

// 	if deltaHours < 0 {
// 		panic("cannot sample inventory before the base update time")
// 	}

// 	result := make(map[game.CommodityID]float64)

// 	for cid := range l.speeds {
// 		_, found := l.baseData.Inventory[cid]

// 		if found {
// 			continue
// 		}

// 		l.baseData.Inventory[cid] = 0
// 	}

// 	for cid, amt := range l.baseData.Inventory {
// 		speed := l.speeds[cid]

// 		if speed == 0.0 {
// 			result[cid] = amt
// 		} else {
// 			result[cid] = amt + speed*deltaHours
// 		}

// 		if result[cid] < 1e-9 {
// 			result[cid] = 0
// 		}
// 	}

// 	return result
// }

// func (l *BaseUpdatesLogic) AlterInventory(at time.Time, changes map[game.CommodityID]float64) common.Error {
// 	l.InsertManualPoint(at)

// 	for cid, delta := range changes {
// 		amt := l.baseData.Inventory[cid]
// 		newAmt := amt + delta

// 		if newAmt < 0.0 {
// 			return common.NewValidationError(
// 				"UpdateInventory.changes",
// 				"insuffucient inventory",
// 				common.WithDetails(common.NewDictEncodable().Set("commodity", cid)),
// 			)
// 		}

// 		l.baseData.Inventory[cid] = newAmt
// 	}

// 	// TODO: check for inventory overflow

// 	// kicking off the production recipes that were halted because of no inputs
// 	l.rerunHaltedProduction()

// 	return nil
// }

// func (l *BaseUpdatesLogic) calcInventoryChangeSpeeds() {
// 	l.speeds = make(map[game.CommodityID]float64)

// 	uncalculatedProducersCounts := make(map[game.CommodityID]int)
// 	// idealIns := make([]map[game.CommodityID]float64, 0, len(l.baseData.Production))
// 	// idealOuts := make([]map[game.CommodityID]float64, 0, len(l.baseData.Production))

// 	for _, production := range l.baseData.Production {
// 		if !production.IsActive {
// 			continue
// 		}

// 		recipe := l.reg.GetRecipe(production.Template)
// 		outputCIDs := make(map[game.CommodityID]bool)
// 		for cid := range recipe.StaticOutputs {
// 			outputCIDs[cid] = true
// 		}
// 		if production.DynamicOutputs != nil {
// 			for cid := range production.DynamicOutputs {
// 				outputCIDs[cid] = true
// 			}
// 		}

// 		for cid := range outputCIDs {
// 			uncalculatedProducersCounts[cid] += 1
// 		}
// 	}

// 	for _, production := range l.baseData.Production {
// 		if !production.IsActive {
// 			continue
// 		}

// 		inouts := l.calculateProductionInOutsPerHour(production)

// 		for cid, rate := range inouts {
// 			l.speeds[cid] += rate
// 		}
// 	}
// }

// func (l *BaseUpdatesLogic) calculateProductionInOutsPerHour(bpi game.BaseProductionItem) map[game.CommodityID]float64 {
// 	inouts := make(map[game.CommodityID]float64)

// 	recipe := l.reg.GetRecipe(bpi.Template)
// 	beq := l.baseData.Equipment[recipe.Equipment]

// 	// speed is determined by productivity and equipment count,
// 	coeff := l.CalcEquipmentWorkforceProductivity(beq) * float64(beq.Count)
// 	// as well as recipe base duration (resulting speeds are per hour)
// 	coeff *= float64(time.Hour.Milliseconds()) / float64(recipe.BaseDuration.Milliseconds())

// 	for cid, amount := range recipe.StaticInputs {
// 		inouts[cid] -= amount * coeff
// 	}
// 	for cid, amount := range recipe.StaticOutputs {
// 		// dynamic outputs must override static ones
// 		if bpi.DynamicOutputs != nil {
// 			_, found := bpi.DynamicOutputs[cid]
// 			if found {
// 				continue
// 			}
// 		}

// 		inouts[cid] += amount * coeff
// 	}

// 	for cid, amount := range bpi.DynamicOutputs {
// 		inouts[cid] += amount * coeff
// 	}

// 	return inouts
// }

// func (l *BaseUpdatesLogic) calcNextUpdate() baseUpdatePoint {
// 	update := baseUpdatePoint{
// 		deltaHours: 1e12, // big enough
// 	}

// 	for cid, speed := range l.speeds {
// 		if speed >= 0 {
// 			// this commodity is not increasing
// 			// TODO: take storage limits into account
// 			continue
// 		}

// 		commodityAmount := l.baseData.Inventory[cid]
// 		hoursUntilZero := commodityAmount / (-speed)

// 		if hoursUntilZero < update.deltaHours {
// 			update = baseUpdatePoint{
// 				deltaHours: hoursUntilZero,
// 			}
// 		}
// 	}

// 	for _, production := range l.baseData.Production {
// 		if production.ActiveUntil.IsZero() || !production.IsActive {
// 			continue
// 		}

// 		hoursUntilStop := production.ActiveUntil.Sub(l.baseData.Updated).Hours()
// 		if hoursUntilStop < update.deltaHours {
// 			update = baseUpdatePoint{
// 				deltaHours: hoursUntilStop,
// 				t:          production.ActiveUntil,
// 			}
// 		}
// 	}

// 	if update.t.IsZero() {
// 		update.t = l.baseData.Updated.Add(time.Duration(update.deltaHours * float64(time.Hour)))
// 	}

// 	return update
// }

// func (l *BaseUpdatesLogic) adjustInventoryToNextPoint(deltaHours float64) {
// 	if deltaHours <= 0 {
// 		panic("updateInventory: cannot update into past")
// 	}

// 	for cid, speed := range l.speeds {
// 		if speed == 0.0 {
// 			continue
// 		}

// 		l.baseData.Inventory[cid] += deltaHours * speed
// 		if l.baseData.Inventory[cid] < 1e-9 {
// 			l.baseData.Inventory[cid] = 0.0
// 		}
// 	}
// }

// func (l *BaseUpdatesLogic) haltProductionAfterUpdate(update baseUpdatePoint) {
// 	// FIXME: (still) looks too messy
// 	for i, production := range l.baseData.Production {
// 		if !production.IsActive {
// 			continue
// 		}

// 		if !production.ActiveUntil.IsZero() &&
// 			!production.ActiveUntil.After(update.t) {
// 			// stop production if it was limited and the limit was reached
// 			production.IsActive = false
// 		}

// 		if production.IsActive {
// 			// stop production if one of its inputs has run out
// 			recipe := l.reg.GetRecipe(production.Template)

// 			for cid := range recipe.StaticInputs {
// 				if l.baseData.Inventory[cid] <= 0.0 {
// 					production.IsActive = false
// 					break
// 				}
// 			}
// 		}

// 		l.baseData.Production[i] = production
// 	}
// }

// func (l *BaseUpdatesLogic) rerunHaltedProduction() {
// 	for i, production := range l.baseData.Production {
// 		if production.IsActive {
// 			continue
// 		}

// 		recipe := l.reg.GetRecipe(production.Template)

// 		hasEnoughInputs := true
// 		for cid := range recipe.StaticInputs {
// 			if l.baseData.Inventory[cid] <= 0.0 {
// 				hasEnoughInputs = false
// 				break
// 			}
// 		}

// 		if !hasEnoughInputs {
// 			continue
// 		}

// 		production.IsActive = true
// 		l.baseData.Production[i] = production
// 	}
// }
