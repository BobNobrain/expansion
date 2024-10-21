import { createMemo, type Component } from 'solid-js';
import { type CelestialBodyClass, type CelestialBody } from '../../domain/CelestialBody';
import { type Icon, IconMoon, IconPlanet, IconPlot } from '../../icons';
import { formatScalar } from '../../lib/strings';
import { ContentList } from '../ContentList/ContentList';
import { type ContentItem, type ContentItemProperty } from '../ContentList/types';

type BodyClass = CelestialBodyClass | 'moon';

const iconsByPlanetType: { [key in BodyClass]?: Icon } = {
    terrestial: IconPlanet,
    moon: IconMoon,
};
// const namesByBodyClass: { [key in BodyClass]?: string } = {
//     terrestial: 'Rocky',
//     gaseous: 'Gas Giant',
//     moon: 'Moon',
// };

export type SystemContentSurfacesListProps = {
    bodies: CelestialBody[];
};

export const SystemContentSurfacesList: Component<SystemContentSurfacesListProps> = (props) => {
    const items = createMemo<ContentItem[]>(() => {
        return props.bodies.map((b): ContentItem => {
            const isMoon = b.id.includes('_');
            const bodyClass = isMoon ? 'moon' : b.class;

            const properties: ContentItemProperty[] = [
                {
                    icon: IconPlot,
                    text: b.isExplored ? formatScalar(b.size, { digits: 0 }) : '??',
                },
                {
                    icon: IconPlanet,
                    text: formatScalar(b.radiusKm, { unit: 'km', noShortenings: true, digits: 0 }),
                },
            ];

            if (b.isExplored) {
                properties.push({
                    text: formatScalar(b.surface.tempK - 273.15, { unit: '°C', noShortenings: true, digits: 2 }),
                });
                properties.push({
                    text: formatScalar(b.surface.pressureBar, { unit: 'bar', noShortenings: true, digits: 2 }),
                });
                properties.push({
                    text: formatScalar(b.surface.g, { unit: 'g', noShortenings: true, digits: 1 }),
                });
            }

            return {
                humanId: '#' + b.id,
                title: b.id,
                icon: iconsByPlanetType[bodyClass],
                properties,
            };
        });
    });

    return <ContentList items={items()} />;
};
