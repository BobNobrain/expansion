import { type Component, createMemo } from 'solid-js';
import { useExploreRouteInfo, useExploreRouteObjectId } from '../../routes/explore';
import { OperationDisplay } from '../OperationDisplay/OperationDisplay';
import { dfWorlds } from '../../store/datafront';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { SkeletonText } from '../Skeleton';
import { formatInteger, formatScalar } from '../../lib/strings';
import { Container } from '../Container/Container';
import { Badge } from '../Badge/Badge';
import { IconCloud, IconLeaf, IconUnknown } from '../../icons';
import { PageHeader, PageHeaderTitle } from '../PageHeader';

type PlotInfo = {
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
    resources?: unknown;
};

const defProps: DefinitionListProperties<PlotInfo> = {
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
    resources: {
        title: 'Resources',
        render: () => '--',
    },
};

export const WorldTileInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const worldId = useExploreRouteObjectId('world');
    const world = dfWorlds.useSingle(worldId);

    const plotInfo = createMemo<PlotInfo>(() => {
        const worldData = world.result();
        const plotId = routeInfo().plotId;
        if (!worldData || !plotId) {
            return { id: plotId ?? '--' };
        }

        const plotIndex = Number.parseInt(plotId, 16);

        return {
            id: plotId,
            biome: worldData.biomes[plotIndex],
            elevation: {
                km: worldData.elevationsScaleKm * worldData.elevations[plotIndex],
                rel: worldData.elevations[plotIndex],
            },
            infraLevels: { power: 0, transport: 0 },
            occupation: 'empty',
            soil:
                worldData.soilFertilities && worldData.moistureLevels
                    ? {
                          fertility: worldData.soilFertilities[plotIndex],
                          moisture: worldData.moistureLevels[plotIndex],
                      }
                    : undefined,
        };
    });

    return (
        <OperationDisplay error={world.error()} loading={world.isLoading()}>
            <PageHeader>
                <PageHeaderTitle>Planetary plot #{routeInfo().plotId ?? '??'}</PageHeaderTitle>
            </PageHeader>
            <DefinitionList items={defProps} value={plotInfo()} isLoading={world.isLoading()} />
        </OperationDisplay>
    );
};
