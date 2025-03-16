import { type Component, createMemo, Show } from 'solid-js';
import { Badge } from '../Badge/Badge';
import { CommodityIcon } from '../CommodityIcon/CommodityIcon';
import { Container, Spacer } from '../Container/Container';
import { DataTable, type DataTableColumn } from '../DataTable';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { OperationDisplay } from '../OperationDisplay/OperationDisplay';
import { PageHeader, PageHeaderActions, PageHeaderIcon, PageHeaderTitle } from '../PageHeader';
import { SkeletonText } from '../Skeleton';
import { World, type ResourceDeposit } from '../../domain/World';
import { IconCity, IconCloud, IconFlag, IconLeaf, IconPlot, IconRails, IconRocks, IconUnknown } from '../../icons';
import { formatInteger, formatScalar } from '../../lib/strings';
import { useExploreRouteInfo, useExploreRouteObjectId } from '../../routes/explore';
import { dfWorlds } from '../../store/datafront';
import { InlineLoader } from '../InlineLoader/InlineLoader';
import { Button } from '../Button/Button';
import { TouchModal } from '../../touch/components/TouchModal';
import { useModalRouteState } from '../../routes/modals';
import { FoundCityForm } from '../FoundCityForm/FoundCityForm';

type TileInfo = {
    id: string;
    elevation?: { km: number; rel: number };
    biome?: string;
    occupation?: 'city' | 'base' | 'infra' | 'empty';
    infraLevels?: {
        transport: number;
        power: number;
    };
    soil?: {
        fertility: number;
        moisture: number;
    };
};

const defProps: DefinitionListProperties<TileInfo> = {
    id: {
        title: 'ID',
        render: 'id',
    },
    elevation: {
        title: 'Altitude',
        render: (v) => {
            if (!v.elevation) {
                return <SkeletonText length={6} />;
            }

            const km = formatScalar(v.elevation.km * 1000, { digits: 0, unit: 'm', noShortenings: true });
            const rel = formatScalar(v.elevation.rel * 100, { digits: 1, unit: '%', noShortenings: true });
            return `${km} (${rel})`;
        },
    },
    biome: {
        title: 'Biome',
        render: 'biome',
    },
    occupation: {
        title: 'Occupation',
        render: 'occupation',
    },
    infraLevels: {
        title: 'Infrastructure',
        render: (v) => {
            if (!v.infraLevels) {
                return <SkeletonText length={10} />;
            }

            return (
                <Container direction="row" hasGap>
                    <Badge iconLeft={IconUnknown} style="trasparent">
                        {formatInteger(v.infraLevels.power)}/4
                    </Badge>
                    <Badge iconLeft={IconUnknown} style="trasparent">
                        {formatInteger(v.infraLevels.transport)}/4
                    </Badge>
                </Container>
            );
        },
    },
    soil: {
        title: 'Soil',
        render: (v) => {
            if (!v.soil) {
                return '--';
            }

            const fertility =
                v.soil.fertility >= 0
                    ? formatScalar(v.soil.fertility * 100, { digits: 1, unit: '%', noShortenings: true })
                    : '--';

            return (
                <Container direction="row" hasGap>
                    <Badge style="trasparent" iconLeft={IconLeaf}>
                        {fertility}
                    </Badge>
                    <Badge style="trasparent" iconLeft={IconCloud}>
                        {formatScalar(v.soil.moisture * 100, { digits: 1, unit: '%', noShortenings: true })}
                    </Badge>
                </Container>
            );
        },
    },
};

const RESOURCE_COLUMNS: DataTableColumn<ResourceDeposit>[] = [
    {
        content: (row) => <CommodityIcon resource={row.resource} />,
        width: 48,
    },
    {
        header: 'Resource',
        content: 'resource',
    },
    {
        header: 'Quality',
        width: 100,
        align: 'right',
        content: (row) =>
            formatScalar(row.abundance * 100, {
                digits: 1,
                unit: '%',
                noShortenings: true,
            }),
    },
];

export const WorldTileInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const worldId = useExploreRouteObjectId('world');
    const world = dfWorlds.useSingle(worldId);

    const tileInfo = createMemo<TileInfo>(() => {
        const worldData = world.result();
        const tileId = routeInfo().tileId;
        if (!worldData || !tileId) {
            return { id: tileId ?? '--' };
        }

        const tileIndex = World.parseTileId(tileId)!;

        return {
            id: tileId,
            biome: worldData.biomes[tileIndex],
            elevation: {
                km: worldData.elevationsScaleKm * worldData.elevations[tileIndex],
                rel: worldData.elevations[tileIndex],
            },
            infraLevels: { power: 0, transport: 0 },
            occupation: 'empty',
            soil:
                worldData.soilFertilities && worldData.moistureLevels
                    ? {
                          fertility: worldData.soilFertilities[tileIndex],
                          moisture: worldData.moistureLevels[tileIndex],
                      }
                    : undefined,
        };
    });

    const resourceRows = createMemo(() => {
        const worldData = world.result();
        const tileId = routeInfo().tileId;
        if (!worldData || !tileId) {
            return [];
        }

        const tileIndex = World.parseTileId(tileId)!;
        return worldData.resources[tileIndex] ?? [];
    });

    const foundCityModal = useModalRouteState('foundCity');

    return (
        <>
            <OperationDisplay error={world.error()} loading={world.isLoading()}>
                <PageHeader>
                    <PageHeaderTitle>Tile</PageHeaderTitle>
                    {/* <IconPlot size={20} block /> */}
                    <PageHeaderIcon icon={IconPlot} />
                    <Spacer />
                    <PageHeaderActions>
                        <Button square style="light">
                            <IconFlag size={32} block />
                        </Button>
                        <Button square style="light" onClick={foundCityModal.open}>
                            <IconCity size={32} block />
                        </Button>
                        <Button square style="light">
                            <IconRails size={32} block />
                        </Button>
                    </PageHeaderActions>
                </PageHeader>
                <DefinitionList items={defProps} value={tileInfo()} isLoading={world.isLoading()} />

                <PageHeader>
                    <PageHeaderTitle>Resource Deposits</PageHeaderTitle>
                    <Show when={world.result()}>
                        <PageHeaderIcon icon={IconRocks} text={resourceRows().length.toString()} />
                    </Show>
                </PageHeader>
                <DataTable columns={RESOURCE_COLUMNS} rows={resourceRows()}>
                    <Show when={world.isLoading()} fallback="No resource deposits on this plot">
                        <InlineLoader />
                    </Show>
                </DataTable>
            </OperationDisplay>

            <TouchModal isOpen={foundCityModal.isOpen()} onClose={foundCityModal.close} title="Found City">
                <FoundCityForm onSuccess={foundCityModal.close} />
            </TouchModal>
        </>
    );
};
