import { createMemo, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { type CelestialBody, type CelestialBodyClass } from '../../../../domain/CelestialBody';
import {
    type Icon,
    IconFlag,
    IconG,
    IconGasGiant,
    IconMoon,
    IconPeople,
    IconPlanet,
    IconPlot,
    IconPressure,
    IconTemperature,
} from '../../../../icons';
import { emulateLinkClick } from '../../../../lib/solid/emulateLinkClick';
import { formatDegreesCelsius, formatScalar } from '../../../../lib/strings';
import { getExploreRoute, useExploreRouteInfo } from '../../../../routes/explore';
import { useSystemContent } from '../../../../store/galaxy';
import { CelestialBodyTitle } from '../../../../components/CelestialBodyTitle/CelestialBodyTitle';
import { DataTable, type DataTableColumn } from '../../../../components/DataTable';

type BodyClass = CelestialBodyClass | 'moon';

type TableRow = Omit<CelestialBody, 'class'> & { class: BodyClass };

const iconsByPlanetType: { [key in BodyClass]?: Icon } = {
    terrestial: IconPlanet,
    gaseous: IconGasGiant,
    moon: IconMoon,
};

const fakeNames: Record<string, string | undefined> = {
    'OT-056a': 'Sigismundo',
    'OT-056c': 'Khasee',
};

const SURFACE_COLUMNS: DataTableColumn<TableRow>[] = [
    {
        header: 'Planet',
        content: (row) => {
            return <CelestialBodyTitle name={fakeNames[row.id]} id={row.id} icon={iconsByPlanetType[row.class]} />;
        },
        width: 120,
    },
    {
        header: { icon: IconPlot },
        content: (row) => (row.isExplored ? formatScalar(row.size, { digits: 0 }) : '??'),
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconPeople },
        content: (row) => (row.isExplored ? '0' : '--'),
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconFlag },
        content: (row) => (row.isExplored ? '0' : '--'),
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconTemperature },
        content: (row) => (row.isExplored ? formatDegreesCelsius(row.surface.tempK, { unit: 'K' }) : '??'),
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconPressure },
        content: (row) =>
            row.isExplored
                ? formatScalar(row.surface.pressureBar, { unit: 'bar', noShortenings: true, digits: 0 })
                : '??',
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconG },
        content: (row) =>
            row.isExplored ? formatScalar(row.surface.g, { unit: 'g', noShortenings: true, digits: 1 }) : '??',
        width: 64,
        align: 'right',
    },
];

export const SystemContentPlanets: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const navigate = useNavigate();
    const sc = useSystemContent(() => routeInfo().objectId);

    const items = createMemo<TableRow[]>(() => {
        if (!sc.data) {
            return [];
        }

        const { orbits, stars, bodies } = sc.data;
        const rows: TableRow[] = [];

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

            rows.push({
                ...body,
                class: bodyClass,
            });
        }

        return rows;
    });

    const onRowClick = (row: TableRow, ev: MouseEvent) => {
        emulateLinkClick(
            {
                href: getExploreRoute({ objectId: row.id }),
                navigate,
            },
            ev,
        );
    };

    return <DataTable columns={SURFACE_COLUMNS} rows={items()} stickLeft onRowClick={onRowClick} />;
};
