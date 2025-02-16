import { type Component, createMemo } from 'solid-js';
import { useExploreRouteInfo, useExploreRouteObjectId } from '../../routes/explore';
import { OperationDisplay } from '../OperationDisplay/OperationDisplay';
import { dfWorlds } from '../../store/datafront';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { SkeletonText } from '../Skeleton';
import { formatInteger, formatScalar } from '../../lib/strings';
import { Container } from '../Container/Container';
import { Badge } from '../Badge/Badge';
import { IconUnknown } from '../../icons';
import { PageHeader, PageHeaderTitle } from '../PageHeader';

type PlotInfo = {
    id: string;
    elevationKm?: number;
    biome?: string;
    occupation?: 'city' | 'base' | 'infra' | 'empty';
    infraLevels?: {
        transport: number;
        power: number;
    };
    resources?: unknown;
};

const defProps: DefinitionListProperties<PlotInfo> = {
    id: {
        title: 'ID',
        render: 'id',
    },
    elevationKm: {
        title: 'Altitude',
        render: (v) =>
            v.elevationKm === undefined ? (
                <SkeletonText length={4} />
            ) : (
                formatScalar(v.elevationKm * 1000, { digits: 0, unit: 'm', noShortenings: true })
            ),
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
            elevationKm: worldData.elevationsScaleKm * worldData.elevations[plotIndex],
            infraLevels: { power: 0, transport: 0 },
            occupation: 'empty',
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
