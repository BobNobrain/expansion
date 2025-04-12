import { createMemo, Show, type Component } from 'solid-js';
import { type World } from '../../domain/World';
import { type City } from '../../domain/City';
import { IconLeaf, IconCloud, IconCity, IconFlag, IconRails, IconTile, IconEnergy } from '../../icons';
import { type UseTableSingleResult } from '../../lib/datafront/types';
import { formatScalar, formatInteger } from '../../lib/strings';
import { getExploreRoute } from '../../routes/explore';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Container, Spacer } from '../Container/Container';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { Link } from '../Link/Link';
import { PageHeader, PageHeaderTitle, PageHeaderIcon, PageHeaderActions } from '../PageHeader';
import { SkeletonText } from '../Skeleton';

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
    city?: { name: string; centerTileLink?: string };
};

const tileDefProps: DefinitionListProperties<TileInfo> = {
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
                    <Badge iconLeft={IconEnergy} style="transparent">
                        {formatInteger(v.infraLevels.power)}/4
                    </Badge>
                    <Badge iconLeft={IconRails} style="transparent">
                        {formatInteger(v.infraLevels.transport)}/4
                    </Badge>
                </Container>
            );
        },
    },
    city: {
        title: 'City',
        render: (v) => {
            if (!v.city) {
                return '--';
            }

            if (!v.city.centerTileLink) {
                return v.city.name;
            }

            return <Link href={v.city.centerTileLink}>{v.city.name}</Link>;
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
                    <Badge style="transparent" iconLeft={IconLeaf}>
                        {fertility}
                    </Badge>
                    <Badge style="transparent" iconLeft={IconCloud}>
                        {formatScalar(v.soil.moisture * 100, { digits: 1, unit: '%', noShortenings: true })}
                    </Badge>
                </Container>
            );
        },
    },
};

type Props = {
    world: UseTableSingleResult<World>;
    tileId: string | undefined;
    tileIndex: number | undefined;

    tileCity: City | null;

    onFoundCityClick: () => void;
};

export const TileInfoDefList: Component<Props> = (props) => {
    const tileInfo = createMemo<TileInfo>(() => {
        const worldData = props.world.result();
        const tileId = props.tileId;
        const tileIndex = props.tileIndex;

        if (!worldData || !tileId || tileIndex === undefined) {
            return { id: tileId ?? '--' };
        }

        const city = props.tileCity;

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
            city: city
                ? {
                      name: city.name,
                      centerTileLink:
                          city.centerTileId === tileId
                              ? undefined
                              : getExploreRoute({
                                    objectId: worldData.id,
                                    tab: city.centerTileId,
                                }),
                  }
                : undefined,
        };
    });

    const availableActions = createMemo<{ city: boolean; base: boolean; infra: boolean }>(() => {
        // TBD: check for bases and infra projects
        const isClaimedByCity = props.tileCity !== null;
        const isCityCenter = props.tileCity !== null && props.tileCity.centerTileId === props.tileId;

        return {
            base: !isCityCenter,
            city: !isClaimedByCity,
            infra: !isCityCenter,
        };
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Tile</PageHeaderTitle>
                <PageHeaderIcon icon={IconTile} />
                <Spacer />
                <PageHeaderActions>
                    <Show when={availableActions().base}>
                        <Button square style="light">
                            <IconFlag size={32} block />
                        </Button>
                    </Show>
                    <Show when={availableActions().city}>
                        <Button square style="light" onClick={props.onFoundCityClick}>
                            <IconCity size={32} block />
                        </Button>
                    </Show>
                    <Show when={availableActions().infra}>
                        <Button square style="light">
                            <IconRails size={32} block />
                        </Button>
                    </Show>
                </PageHeaderActions>
            </PageHeader>
            <DefinitionList items={tileDefProps} value={tileInfo()} isLoading={props.world.isLoading()} />
        </>
    );
};
