package db

import (
	"context"
	"encoding/json"
	"errors"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5"
)

type basesRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

type baseDataJSON struct {
	Inventory map[string]float64 `json:"inventory"`
	// TBD: storage capacity
}

func (b *basesRepoImpl) GetBase(id game.BaseID) (*game.Base, common.Error) {
	row, dberr := b.q.GetBaseByID(b.ctx, int32(id))
	if dberr != nil {
		if errors.Is(dberr, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, makeDBError(dberr, "BasesRepo::GetBase")
	}

	decoded, err := decodeBase(row)
	if err != nil {
		return nil, err
	}
	return &decoded, nil
}

func (b *basesRepoImpl) GetBaseAt(worldID game.CelestialID, tileID game.TileID) (*game.Base, common.Error) {
	row, dberr := b.q.GetBaseByLocation(b.ctx, dbq.GetBaseByLocationParams{WorldID: string(worldID), TileID: int16(tileID)})
	if dberr != nil {
		if errors.Is(dberr, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, makeDBError(dberr, "BasesRepo::GetBaseAt")
	}

	decoded, err := decodeBase(row)
	if err != nil {
		return nil, err
	}
	return &decoded, nil
}

func (b *basesRepoImpl) ResolveBases(ids []game.BaseID) ([]game.Base, common.Error) {
	rows, dberr := b.q.ResolveBases(b.ctx, utils.ConvertInts[game.BaseID, int32](ids))
	if dberr != nil {
		return nil, makeDBError(dberr, "BasesRepo::ResolveBases")
	}

	return utils.MapSliceFailable(rows, decodeBase)
}

func (b *basesRepoImpl) ResolveOverviews(ids []game.BaseID) ([]game.BaseOverview, common.Error) {
	rows, dberr := b.q.ResolveBaseOverviews(b.ctx, utils.ConvertInts[game.BaseID, int32](ids))
	if dberr != nil {
		return nil, makeDBError(dberr, "BasesRepo::ResolveOverviews")
	}

	return utils.MapSlice(rows, decodeBaseOverview), nil
}

func (b *basesRepoImpl) GetCompanyBases(cid game.CompanyID) ([]game.BaseOverview, common.Error) {
	uuid, err := parseUUID(cid)
	if err != nil {
		return nil, err
	}

	rows, dberr := b.q.GetBasesByCompanyID(b.ctx, uuid)
	if dberr != nil {
		return nil, makeDBError(dberr, "BasesRepo::GetCompanyBases")
	}

	return utils.MapSlice(rows, decodeBaseOverview), nil
}

func (b *basesRepoImpl) GetCompanyBasesOnPlanet(cid game.CompanyID, worldID game.CelestialID) ([]game.BaseOverview, common.Error) {
	uuid, err := parseUUID(cid)
	if err != nil {
		return nil, err
	}

	rows, dberr := b.q.GetBasesByCompanyIDAndWorldID(b.ctx, dbq.GetBasesByCompanyIDAndWorldIDParams{
		CompanyID: uuid,
		WorldID:   string(worldID),
	})
	if dberr != nil {
		return nil, makeDBError(dberr, "BasesRepo::GetCompanyBasesOnPlanet")
	}

	return utils.MapSlice(rows, decodeBaseOverview), nil
}

func (b *basesRepoImpl) CreateBase(payload components.CreateBasePayload) common.Error {
	operator, err := parseUUID(payload.Operator)
	if err != nil {
		return err
	}

	baseData, jerr := json.Marshal(baseDataJSON{
		Inventory: make(map[string]float64),
	})
	if jerr != nil {
		return makeDBError(jerr, "BasesRepo::CreateCompanyBase")
	}

	owner, err := parseUUID(payload.OwnerID)
	if err != nil {
		return err
	}

	dberr := b.q.CreateBase(b.ctx, dbq.CreateBaseParams{
		SystemID:  string(payload.WorldID.GetStarSystemID()),
		WorldID:   string(payload.WorldID),
		TileID:    int16(payload.TileID),
		CompanyID: operator,
		CityID:    int32(payload.CityID),
		Data:      baseData,
		Name:      payload.Name,
		OwnerID:   owner,
	})
	if dberr != nil {
		return makeDBError(dberr, "BasesRepo::CreateCompanyBase")
	}

	return nil
}

func (b *basesRepoImpl) UpdateBaseContent(base game.Base) common.Error {
	data, jerr := json.Marshal(encodeBaseData(base))
	if jerr != nil {
		return makeDBError(jerr, "BasesRepo::UpdateBaseContent(encodeBaseData)")
	}

	dberr := b.q.UpdateBase(b.ctx, dbq.UpdateBaseParams{
		ID:   int32(base.ID),
		Data: data,
	})
	if dberr != nil {
		return makeDBError(jerr, "BasesRepo::UpdateBaseContent")
	}

	return nil
}

func (b *basesRepoImpl) RenameBase(bid game.BaseID, uid domain.UserID, name string) common.Error {
	dberr := b.q.RenameBase(b.ctx, dbq.RenameBaseParams{
		ID:   int32(bid),
		Name: name,
	})
	if dberr != nil {
		return makeDBError(dberr, "BasesRepo::RenameBase")
	}

	return nil
}

func (b *basesRepoImpl) DeleteBase(bid game.BaseID) common.Error {
	dberr := b.q.DestroyBase(b.ctx, int32(bid))
	if dberr != nil {
		return makeDBError(dberr, "BasesRepo::DeleteBase")
	}

	return nil
}

func encodeBaseData(base game.Base) baseDataJSON {
	data := baseDataJSON{
		Inventory: base.Inventory.ToMap(),
	}

	return data
}

func decodeBase(row dbq.Base) (game.Base, common.Error) {
	baseData, err := parseJSON[baseDataJSON](row.Data)
	if err != nil {
		return game.Base{}, err
	}

	base := game.Base{
		ID:        game.BaseID(row.ID),
		Created:   row.EstablishedAt.Time,
		Operator:  game.CompanyID(row.CompanyID.String()),
		WorldID:   game.CelestialID(row.WorldID),
		TileID:    game.TileID(row.TileID),
		CityID:    game.CityID(row.CityID),
		OwnerID:   domain.UserID(row.OwnerID.String()),
		Name:      row.Name,
		Inventory: game.MakeInventoryFrom(baseData.Inventory),
	}

	return base, nil
}

func decodeBaseOverview(row dbq.BaseOverview) game.BaseOverview {
	return game.BaseOverview{
		ID:       game.BaseID(row.ID),
		Created:  row.EstablishedAt.Time,
		Operator: game.CompanyID(row.CompanyID.String()),
		WorldID:  game.CelestialID(row.WorldID),
		TileID:   game.TileID(row.TileID),
		CityID:   game.CityID(row.CityID),
		OwnerID:  domain.UserID(row.OwnerID.String()),
		PrivateInfo: &game.BaseOverviewPrivateInfo{
			Name:       row.Name,
			NFactories: int(row.NFactories),
		},
	}
}
