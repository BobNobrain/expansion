import { type Component, createMemo, Show } from 'solid-js';
import { type City } from '../../domain/City';
import { World } from '../../domain/World';
import { useExploreRouteInfo, useExploreRouteObjectId } from '../../routes/explore';
import { useModalRouteState } from '../../routes/modals';
import { dfWorlds, dfCitiesByWorldId } from '../../store/datafront';
import { TouchModal } from '../../touch/components/TouchModal'; // ! FIXME: bad import
import { TouchBottomSheet } from '../../touch/components/TouchBottomSheet/TouchBottomSheet';
import { CreateBaseForm } from '../CreateBaseForm/CreateBaseForm';
import { FoundCityForm } from '../FoundCityForm/FoundCityForm';
import { OperationDisplay } from '../OperationDisplay/OperationDisplay';
import { PageHeader, PageHeaderTitle } from '../PageHeader';
import { TileInfoDefList } from './TileInfo';
import { TileResources } from './TileResources';
import { TileCityInfo } from './TileCityInfo';
import { Container } from '../Container/Container';

export const WorldTileInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const worldId = useExploreRouteObjectId('world');
    const world = dfWorlds.useSingle(worldId);
    const worldCities = dfCitiesByWorldId.use(() => {
        const id = worldId();
        if (!id) {
            return null;
        }
        return { worldId: id };
    });

    const tileIds = createMemo(() => {
        const tileId = routeInfo().tileId;
        const tileIndex = tileId ? World.parseTileId(tileId) : undefined;
        return { tileId, tileIndex };
    });

    const tileCity = createMemo<City | null>(() => {
        const tileId = routeInfo().tileId;
        if (!tileId) {
            return null;
        }

        const cities = worldCities.result();

        for (const city of Object.values(cities)) {
            if (city.centerTileId === tileId) {
                return city;
            }

            if (city.claimedTileIds.includes(tileId)) {
                return city;
            }
        }

        return null;
    });

    const foundCityModal = useModalRouteState('foundCity');
    const createBaseModal = useModalRouteState('createBase');

    return (
        <>
            <OperationDisplay error={world.error()} loading={world.isLoading()}>
                <TileCityInfo city={tileCity()} tileId={tileIds().tileId} />

                <TileInfoDefList
                    world={world}
                    tileCity={tileCity()}
                    {...tileIds()}
                    onFoundCityClick={foundCityModal.open}
                    onCreateBaseClick={createBaseModal.open}
                />

                <TileResources world={world} {...tileIds()} />
            </OperationDisplay>

            <TouchModal isOpen={foundCityModal.isOpen()} onClose={foundCityModal.close} title="Found City">
                <FoundCityForm onSuccess={foundCityModal.close} onCancel={foundCityModal.close} />
            </TouchModal>

            <Show when={worldId() && routeInfo().tileId && tileCity()}>
                <TouchBottomSheet
                    isOpen={createBaseModal.isOpen()}
                    onClose={createBaseModal.close}
                    header={
                        <PageHeader>
                            <PageHeaderTitle>Create a base</PageHeaderTitle>
                        </PageHeader>
                    }
                >
                    <Container padded>
                        <CreateBaseForm worldId={worldId()!} tileId={routeInfo().tileId!} tileCity={tileCity()!} />
                    </Container>
                </TouchBottomSheet>
            </Show>
        </>
    );
};
