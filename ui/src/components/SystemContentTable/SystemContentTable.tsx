import { type Component, Show, createEffect, createMemo } from 'solid-js';
import { useSystemContent } from '../../store/galaxy';
import { type CelestialBody } from '../../domain/CelestialBody';
import { RouteMatcher } from '../RouteMatcher/RouteMatcher';
import { SystemContentSurfacesList } from './SystemContentSurfacesList';
import { SystemContentStarsList } from './SystemContentStarsList';
import { type TabHeader, TabsList } from '../TabsList/TabsList';
import { useNavigate } from '@solidjs/router';
import styles from './SystemContentTable.module.css';
import { getExploreRoute, useExploreRouteInfo } from '../../routes/explore';

export type SystemContentTableProps = {
    systemId: string;
};

const ALLOWED_TABS = ['planets', 'infra', 'stars'];

export const SystemContentTable: Component<SystemContentTableProps> = (props) => {
    const sc = useSystemContent(() => props.systemId);

    const sortedBodies = createMemo<CelestialBody[]>(() => {
        if (!sc.data) {
            return [];
        }

        const { orbits, stars, bodies } = sc.data;
        const rows: CelestialBody[] = [];

        const starIds = stars.map((star) => star.id);
        const sortedOrbits = Object.values(orbits).sort((a, b) => a.bodyId.localeCompare(b.bodyId));
        for (const orbit of sortedOrbits) {
            if (starIds.includes(orbit.bodyId)) {
                continue;
            }

            const body = bodies[orbit.bodyId];
            if (!body) {
                continue;
            }
            rows.push(body);
        }

        return rows;
    });

    const navigate = useNavigate();
    const routeInfo = useExploreRouteInfo();

    const tabs = createMemo<TabHeader[]>(() => {
        const { objectId } = routeInfo();
        return [
            {
                title: 'Planets',
                href: getExploreRoute({ objectId, tab: 'planets' }),
            },
            {
                title: 'Infrastructure',
                href: getExploreRoute({ objectId, tab: 'infra' }),
            },
            {
                title: 'Stars',
                href: getExploreRoute({ objectId, tab: 'stars' }),
            },
        ];
    });

    createEffect(() => {
        const { tab, objectId } = routeInfo();
        if (!tab || !ALLOWED_TABS.includes(tab)) {
            navigate(getExploreRoute({ objectId, tab: 'planets' }), { replace: true });
        }
    });

    return (
        <div class={styles.content}>
            <nav class={styles.tabs}>
                <TabsList tabs={tabs()} />
            </nav>
            <Show when={sc.data} fallback="Loading...">
                <RouteMatcher
                    endsWith="/planets"
                    component={SystemContentSurfacesList}
                    props={{ bodies: sortedBodies() }}
                />
                <RouteMatcher
                    endsWith="/stars"
                    component={SystemContentStarsList}
                    props={{ stars: sc.data!.stars || [] }}
                />
            </Show>
        </div>
    );
};
