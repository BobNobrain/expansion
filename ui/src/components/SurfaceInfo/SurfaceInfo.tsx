import { type Component, createEffect, createMemo, For } from 'solid-js';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { useSurfaceOverview } from '../../store/galaxy';
import { getExploreRoute, useExploreRouteInfo } from '../../routes/explore';
import styles from './SurfaceInfo.module.css';
import {
    IconCity,
    IconFlag,
    IconG,
    IconPeople,
    IconPlot,
    IconPressure,
    IconRadius,
    IconTemperature,
} from '../../icons';
import { formatInteger, formatScalar } from '../../lib/strings';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { useNavigate } from '@solidjs/router';

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
                <Badge iconLeft={IconPlot} style="trasparent">
                    {v.size.plots}
                </Badge>
                <Badge iconLeft={IconRadius} style="trasparent">
                    {formatScalar(v.size.rKm, { digits: 0, unit: 'km', noShortenings: true })}
                </Badge>
            </div>
        ),
    },
    habitants: {
        title: 'Population',
        render: (v) => (
            <div class={styles.badgeList}>
                <Badge iconLeft={IconCity} style="trasparent">
                    {formatInteger(v.habitants.cities)}
                </Badge>
                <Badge iconLeft={IconPeople} style="trasparent">
                    {formatInteger(v.habitants.population)}
                </Badge>
                <Badge iconLeft={IconFlag} style="trasparent">
                    {formatInteger(v.habitants.bases)}
                </Badge>
            </div>
        ),
    },
    environment: {
        title: 'Environment',
        render: (v) => (
            <div class={styles.badgeList}>
                <Badge iconLeft={IconTemperature} style="trasparent">
                    {formatScalar(v.environment.tK, { unit: 'K', digits: 0, noShortenings: true })}
                </Badge>
                <Badge iconLeft={IconPressure} style="trasparent">
                    {formatScalar(v.environment.pBar, { unit: 'bar', digits: 0, noShortenings: true })}
                </Badge>
                <Badge iconLeft={IconG} style="trasparent">
                    {formatScalar(v.environment.g, { digits: 1, noShortenings: true })}
                </Badge>
            </div>
        ),
    },
    atmosphere: {
        title: 'Atmosphere',
        render: (v) => {
            const total = Object.values(v.atmosphere).reduce((acc, next) => acc + next, 0);
            return (
                <div class={styles.percentages}>
                    <For each={Object.keys(v.atmosphere)} fallback="--">
                        {(matId) => {
                            const percentage = formatScalar((v.atmosphere[matId] / total) * 100, {
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
        },
    },
    oceans: {
        title: 'Oceans',
        render: (v) => {
            const total = Object.values(v.oceans).reduce((acc, next) => acc + next, 0);
            return (
                <For each={Object.keys(v.oceans)} fallback="--">
                    {(matId) => {
                        const percentage = formatScalar((v.oceans[matId] / total) * 100, { unit: '%', digits: 1 });
                        return (
                            <span class={styles.material}>
                                {matId}&nbsp;&mdash;&nbsp;{percentage}
                            </span>
                        );
                    }}
                </For>
            );
        },
    },
};

export const SurfaceInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const surface = useSurfaceOverview(() => routeInfo().objectId);

    createEffect(() => {
        console.log('SurfaceInfo', surface);
    });

    const navigate = useNavigate();

    createEffect(() => {
        const { tab, objectId } = routeInfo();
        if (!tab) {
            navigate(getExploreRoute({ objectId, tab: 'info' }), { replace: true });
        }
    });

    const value = createMemo<DefListValue | null>((): DefListValue | null => {
        if (!surface.data) {
            return null;
        }

        return {
            id: surface.data.body.id,
            name: undefined,
            size: {
                plots: surface.data?.body.size,
                rKm: surface.data.body.radiusKm,
            },
            habitants: {
                cities: 0,
                population: 0,
                bases: 0,
            },
            environment: {
                tK: surface.data.body.surface.tempK,
                pBar: surface.data.body.surface.pressureBar,
                g: surface.data.body.surface.g,
            },
            atmosphere: surface.data.surface.atmosphere,
            oceans: surface.data.surface.oceans,
        };
    });

    return (
        <div class={styles.wrapper}>
            <div class={styles.actions}>
                <Button size="s">Share</Button>
                <Button size="s">Bookmark</Button>
            </div>
            <DefinitionList isLoading={surface.isLoading} items={defProps} value={value()} />
        </div>
    );
};
