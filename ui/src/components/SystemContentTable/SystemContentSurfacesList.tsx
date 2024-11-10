import { createMemo, type Component } from 'solid-js';
import { type CelestialBodyClass } from '../../domain/CelestialBody';
import {
    type Icon,
    IconGasGiant,
    IconMoon,
    IconOrbit,
    IconPeople,
    IconPlanet,
    IconPlot,
    IconPressure,
    IconTemperature,
} from '../../icons';
import { formatScalar } from '../../lib/strings';
import { getExploreRoute, useExploreRouteInfo } from '../../routes/explore';
import { useSystemContent } from '../../store/galaxy';
import { ContentList } from '../ContentList/ContentList';
import { type ContentItem, type ContentItemProperty } from '../ContentList/types';

type BodyClass = CelestialBodyClass | 'moon';

const iconsByPlanetType: { [key in BodyClass]?: Icon } = {
    terrestial: IconPlanet,
    gaseous: IconGasGiant,
    moon: IconMoon,
};

export const SystemContentSurfacesList: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const sc = useSystemContent(() => routeInfo().objectId);

    const items = createMemo<ContentItem[]>(() => {
        if (!sc.data) {
            return [];
        }

        const { orbits, stars, bodies } = sc.data;
        const rows: ContentItem[] = [];

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

            const isMoon = body.id.includes('_');
            const bodyClass = isMoon ? 'moon' : body.class;

            const properties: ContentItemProperty[] = [
                {
                    icon: IconPlot,
                    text: body.isExplored ? formatScalar(body.size, { digits: 0 }) : '??',
                },
                {
                    icon: IconPeople,
                    text: body.isExplored ? '0' : '--',
                },
                {
                    icon: IconPlanet,
                    text: formatScalar(body.radiusKm, { unit: 'km', noShortenings: true, digits: 0 }),
                },
                {
                    icon: IconOrbit,
                    text: formatScalar(orbit.semiMajorAu, { unit: 'au', noShortenings: true, digits: 2 }),
                },
            ];

            if (body.isExplored) {
                properties.push({
                    icon: IconTemperature,
                    text: formatScalar(body.surface.tempK - 273.15, { unit: '°C', noShortenings: true, digits: 2 }),
                });
                properties.push({
                    icon: IconPressure,
                    text: formatScalar(body.surface.pressureBar, { unit: 'bar', noShortenings: true, digits: 2 }),
                });
                properties.push({
                    text: formatScalar(body.surface.g, { unit: 'g', noShortenings: true, digits: 1 }),
                });
            }

            rows.push({
                humanId: '#' + body.id,
                title: body.id,
                mainAction: getExploreRoute({ objectId: body.id }),
                icon: iconsByPlanetType[bodyClass],
                properties,
            });
        }

        return rows;
    });

    return <ContentList items={items()} />;
};
