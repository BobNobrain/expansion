import { type Component, createEffect, createMemo, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    IconCity,
    IconFlag,
    IconG,
    IconPeople,
    IconPressure,
    IconRadius,
    IconTemperature,
    IconTile,
} from '../../icons';
import { formatDegreesCelsius, formatInteger, formatScalar } from '../../lib/strings';
import { getExploreRoute, useExploreRouteInfo, useExploreRouteObjectId } from '../../routes/explore';
import { dfExploreWorld, dfWorlds } from '../../store/datafront';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { InfoDisplay } from '../InfoDisplay/InfoDisplay';
import { OperationDisplay } from '../OperationDisplay/OperationDisplay';
import styles from './WorldInfo.module.css';
import { PageHeader, PageHeaderTitle } from '../PageHeader';

type DefListValue = {
    id: string;
    name?: string;
    size: {
        plots: number;
        rKm: number;
    };
    habitants: {
        cities: number;
        bases: number;
        population: number;
    };
    environment: {
        tK: number;
        pBar: number;
        g: number;
    };
    atmosphere: Record<string, number>;
    oceans: Record<string, number>;
    snow: Record<string, number>;
};

const Mixture: Component<{ content: Record<string, number> }> = (props) => {
    const total = createMemo(() => Object.values(props.content).reduce((acc, next) => acc + next, 0));
    return (
        <div class={styles.percentages}>
            <For each={Object.keys(props.content)} fallback="--">
                {(matId) => {
                    const percentage = formatScalar((props.content[matId] / total()) * 100, {
                        unit: '%',
                        digits: 1,
                    });
                    return (
                        <span>
                            {matId}&nbsp;&mdash;&nbsp;{percentage}
                        </span>
                    );
                }}
            </For>
        </div>
    );
};

const defProps: DefinitionListProperties<DefListValue> = {
    id: {
        title: 'ID',
        render: 'id',
    },
    name: {
        title: 'Name',
        render: (v) => v.name ?? '--',
    },
    size: {
        title: 'Size',
        render: (v) => (
            <div class={styles.badgeList}>
                <Badge iconLeft={IconTile} style="transparent">
                    {v.size.plots}
                </Badge>
                <Badge iconLeft={IconRadius} style="transparent">
                    {formatScalar(v.size.rKm, { digits: 0, unit: 'km', noShortenings: true })}
                </Badge>
            </div>
        ),
    },
    habitants: {
        title: 'Population',
        render: (v) => (
            <div class={styles.badgeList}>
                <Badge iconLeft={IconCity} style="transparent">
                    {formatInteger(v.habitants.cities)}
                </Badge>
                <Badge iconLeft={IconPeople} style="transparent">
                    {formatInteger(v.habitants.population)}
                </Badge>
                <Badge iconLeft={IconFlag} style="transparent">
                    {formatInteger(v.habitants.bases)}
                </Badge>
            </div>
        ),
    },
    environment: {
        title: 'Environment',
        render: (v) => (
            <div class={styles.badgeList}>
                <Badge iconLeft={IconTemperature} style="transparent">
                    {formatDegreesCelsius(v.environment.tK, { unit: 'K' })}
                </Badge>
                <Badge iconLeft={IconPressure} style="transparent">
                    {formatScalar(v.environment.pBar, { unit: 'bar', digits: 0, noShortenings: true })}
                </Badge>
                <Badge iconLeft={IconG} style="transparent">
                    {formatScalar(v.environment.g, { digits: 1, noShortenings: true })}
                </Badge>
            </div>
        ),
    },
    atmosphere: {
        title: 'Atmosphere',
        render: (v) => <Mixture content={v.atmosphere} />,
    },
    oceans: {
        title: 'Oceans',
        render: (v) => <Mixture content={v.oceans} />,
    },
    snow: {
        title: 'Snow',
        render: (v) => <Mixture content={v.snow} />,
    },
};

export const WorldInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const navigate = useNavigate();

    const worldId = useExploreRouteObjectId('world');

    const world = dfWorlds.useSingle(worldId);
    const explore = dfExploreWorld.use(() => routeInfo().objectId!);

    createEffect(() => {
        const { tab, objectId } = routeInfo();
        if (!tab) {
            navigate(getExploreRoute({ objectId, tab: 'info' }), { replace: true });
        }
    });

    const value = createMemo<DefListValue | null>((): DefListValue | null => {
        const data = world.result();
        if (!data) {
            return null;
        }

        return {
            id: data.id,
            name: undefined,
            size: {
                plots: data.grid.edges.length,
                rKm: data.params.radiusKm,
            },
            habitants: {
                cities: data.population.cities,
                population: data.population.pops,
                bases: data.population.bases,
            },
            environment: {
                tK: data.surface.tempK,
                pBar: data.surface.pressureBar,
                g: data.surface.g,
            },
            atmosphere: data.atmosphere,
            oceans: data.oceans,
            snow: data.snow,
        };
    });

    const onExploreClick = () => {
        const id = worldId();
        if (!id) {
            return;
        }
        explore.run({ worldId: id });
    };

    return (
        <div class={styles.wrapper}>
            <PageHeader>
                <PageHeaderTitle>Summary</PageHeaderTitle>
                <Show when={world.result()}>
                    <Badge style="transparent" iconLeft={IconTile} color="accent">
                        {world.result()?.grid.edges.length}
                    </Badge>
                </Show>
            </PageHeader>
            <OperationDisplay error={world.error()}>
                <Show
                    when={world.result()?.explored || world.isLoading()}
                    fallback={
                        <InfoDisplay
                            title="World not explored"
                            actions={
                                <Button color="primary" loading={explore.isLoading()} onClick={onExploreClick}>
                                    Explore
                                </Button>
                            }
                        >
                            This world is not explored yet.
                        </InfoDisplay>
                    }
                >
                    <DefinitionList isLoading={world.isLoading()} items={defProps} value={value()} />
                </Show>
            </OperationDisplay>
        </div>
    );
};
