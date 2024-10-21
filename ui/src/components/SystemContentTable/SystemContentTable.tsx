import { type Component, Show, createMemo } from 'solid-js';
import { useSystemContent } from '../../store/galaxy';
import { Text } from '../Text/Text';
import { DataTable, type DataTableColumn } from '../DataTable/DataTable';
import { type Star } from '../../domain/Star';
import { type CelestialBody } from '../../domain/CelestialBody';
import { SystemContentSurfacesList } from './SystemContentSurfacesList';

export type SystemContentTableProps = {
    systemId: string;
};

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

    const starColumns: DataTableColumn<Star>[] = [
        {
            header: 'ID',
            content: 'id',
        },
        {
            header: 'r (au)',
            content: ({ radiusAu }) => radiusAu.toFixed(3),
        },
        {
            header: 'T (K)',
            content: ({ tempK }) => tempK.toFixed(0),
        },
        {
            header: 'Age (byrs)',
            content: ({ ageBillionYears }) => ageBillionYears.toFixed(3),
        },
    ];

    return (
        <Show when={sc.data} fallback="Loading...">
            <section>
                <SystemContentSurfacesList bodies={sortedBodies()} />
            </section>
            <section>
                <Text size="h2">Stars</Text>
                <DataTable columns={starColumns} rows={sc.data!.stars} />
            </section>
        </Show>
    );
};
