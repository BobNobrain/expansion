import { type Component, Show, createMemo } from 'solid-js';
import { useSystemContent } from '../../store/galaxy';
import { Text } from '../Text/Text';
import { DataTable, type DataTableColumn } from '../DataTable/DataTable';
import { type Star } from '../../domain/Star';
import { IconPlanet } from '../../icons/planet';
import { A } from '@solidjs/router';
import { IconMoon } from '../../icons/moon';
import { type CelestialBodyClass } from '../../domain/CelestialBody';

export type SystemContentTableProps = {
    systemId: string;
};

type BodiesTableRow = {
    id: string;
    name: string | undefined;
    type: 'planet' | 'moon';
    ageByrs: number;
    radiusKm: number;
    size: number;
    class: CelestialBodyClass;
    pressureBar: number;
    tempC: number;
    g: number;
};

export const SystemContentTable: Component<SystemContentTableProps> = (props) => {
    const sc = useSystemContent(() => props.systemId);

    const bodies = createMemo<BodiesTableRow[]>(() => {
        if (!sc.data) {
            return [];
        }

        const { orbits, stars, bodies } = sc.data;
        const rows: BodiesTableRow[] = [];

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
            const isPlanet = orbit.aroundId === null || starIds.includes(orbit.aroundId);
            rows.push({
                id: orbit.bodyId,
                name: undefined,
                type: isPlanet ? 'planet' : 'moon',
                ageByrs: body.ageByrs,
                radiusKm: body.radiusKm,
                class: body.class,
                size: body.size,
                tempC: body.surface.tempK - 273.15,
                pressureBar: body.surface.pressureBar,
                g: body.surface.g,
            });
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

    const bodiesColumns: DataTableColumn<BodiesTableRow>[] = [
        {
            header: 'Name',
            content: ({ id, name, type }) => {
                return (
                    <>
                        <div>
                            <Show when={type === 'planet'}>
                                <IconPlanet size={12} />
                            </Show>
                            <Show when={type === 'moon'}>
                                <IconMoon size={12} />
                            </Show>
                            <span>{name || id}</span>
                        </div>
                        <A href={`/galaxy/${id}`}>{id}</A>
                    </>
                );
            },
        },
        {
            header: 'Bodies',
            content: ({ radiusKm, ageByrs, size, class: type }) => {
                return (
                    <>
                        <div>Age {ageByrs} Byrs</div>
                        <div>R {radiusKm} km</div>
                        <div>Size {size} plots</div>
                        <div>Class: {type}</div>
                    </>
                );
            },
        },
    ];

    return (
        <Show when={sc.data} fallback="Loading...">
            <section>
                <Text size="h2">Stars</Text>
                <DataTable columns={starColumns} rows={sc.data!.stars} />
            </section>
            <section>
                <Text size="h2">Planets and Moons</Text>
                <DataTable columns={bodiesColumns} rows={bodies()} />
            </section>
        </Show>
    );
};
