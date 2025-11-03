package db

import (
	"context"
	"encoding/json"
	"errors"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5"
)

type basesRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

type baseDataJSON struct{}

func (b *basesRepoImpl) GetBase(id game.BaseID) (*game.Base, common.Error) {
	row, dberr := b.q.GetBaseByID(b.ctx, int32(id))
	if dberr != nil {
		if errors.Is(dberr, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, makeDBError(dberr, "BasesRepo::GetBase")
	}

	decoded := decodeBase(row)
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

	decoded := decodeBase(row)
	return &decoded, nil
}

func (b *basesRepoImpl) ResolveBases(ids []game.BaseID) ([]game.Base, common.Error) {
	rows, dberr := b.q.ResolveBases(b.ctx, utils.ConvertInts[game.BaseID, int32](ids))
	if dberr != nil {
		return nil, makeDBError(dberr, "BasesRepo::ResolveBases")
	}

	return utils.MapSlice(rows, decodeBase), nil
}

func (b *basesRepoImpl) GetCompanyBases(cid game.CompanyID) ([]game.Base, common.Error) {
	uuid, err := parseUUID(cid)
	if err != nil {
		return nil, err
	}

	rows, dberr := b.q.GetBasesByCompanyID(b.ctx, uuid)
	if dberr != nil {
		return nil, makeDBError(dberr, "BasesRepo::GetCompanyBases")
	}

	return utils.MapSlice(rows, decodeBase), nil
}

func (b *basesRepoImpl) GetCompanyBasesOnPlanet(cid game.CompanyID, worldID game.CelestialID) ([]game.Base, common.Error) {
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

	return utils.MapSlice(rows, decodeBase), nil
}

func (b *basesRepoImpl) CreateBase(payload components.CreateBasePayload) common.Error {
	operator, err := parseUUID(payload.Operator)
	if err != nil {
		return err
	}

	baseData, jerr := json.Marshal(baseDataJSON{})
	if jerr != nil {
		return makeDBError(jerr, "BasesRepo::CreateCompanyBase")
	}

	dberr := b.q.CreateBase(b.ctx, dbq.CreateBaseParams{
		SystemID:  string(payload.WorldID.GetStarSystemID()),
		WorldID:   string(payload.WorldID),
		TileID:    int16(payload.TileID),
		CompanyID: operator,
		CityID:    int32(payload.CityID),
		Data:      baseData,
	})
	if dberr != nil {
		return makeDBError(dberr, "BasesRepo::CreateCompanyBase")
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

func decodeBase(row dbq.Base) game.Base {
	return game.Base{
		ID:       game.BaseID(row.ID),
		Created:  row.EstablishedAt.Time,
		Operator: game.CompanyID(row.CompanyID.String()),
		WorldID:  game.CelestialID(row.WorldID),
		TileID:   game.TileID(row.TileID),
		CityID:   game.CityID(row.CityID),
		Sites:    nil,
	}
}
