import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { type WorldOverview, type WorldClass } from '../../../../domain/WorldOverview';
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
import { CelestialBodyTitle } from '../../../../components/CelestialBodyTitle/CelestialBodyTitle';
import { DataTable, type DataTableColumn } from '../../../../components/DataTable';
import gameDataFront from '../../../../store/datafront';
import { Button } from '../../../../components/Button/Button';
import { InfoDisplay } from '../../../../components/InfoDisplay/InfoDisplay';

type BodyClass = WorldClass | 'moon';

type TableRow = WorldOverview & { isLoading?: true };

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
            const isMoon = row.id.includes('_');
            const bodyClass = isMoon ? 'moon' : row.params.class;
            return <CelestialBodyTitle name={fakeNames[row.id]} id={row.id} icon={iconsByPlanetType[bodyClass]} />;
        },
        width: 120,
    },
    {
        header: { icon: IconPlot },
        content: (row) => (row.isExplored ? '' : '~') + formatScalar(row.size, { digits: 0 }),
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
    const systemInfo = gameDataFront.systems.useQuerySingle('byId', () => ({ systemId: routeInfo().objectId! }));
    const worldOverviews = gameDataFront.worldOverviews.useQuery('bySystemId', () => ({
        systemId: routeInfo().objectId!,
    }));

    const items = createMemo<TableRow[]>(() => {
        const sysInfo = systemInfo.result();
        if (!sysInfo) {
            return [];
        }

        const { orbits, stars } = sysInfo;
        const rows: TableRow[] = [];

        const starIds = stars.map((star) => star.id);
        const sortedOrbits = Object.values(orbits).sort((a, b) => a.bodyId.localeCompare(b.bodyId));

        const bodies = worldOverviews.result();

        for (const orbit of sortedOrbits) {
            if (starIds.includes(orbit.bodyId)) {
                continue;
            }

            const body = bodies[orbit.bodyId];
            if (!body) {
                rows.push({
                    id: orbit.bodyId,
                    isExplored: false,
                    params: {
                        ageByrs: 0,
                        axisTilt: 0,
                        class: 'terrestial',
                        dayLength: 0,
                        massEarths: 0,
                        radiusKm: 0,
                    },
                    size: 0,
                    surface: {
                        g: 0,
                        pressureBar: 0,
                        tempK: 0,
                    },
                    isLoading: true,
                });
                continue;
            }

            rows.push(body);
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

    const explore = gameDataFront.exploreSystem.use(() => routeInfo().objectId!);
    const onExploreClick = () => {
        explore.run({ systemId: routeInfo().objectId! });
    };

    return (
        <div>
            <Show
                when={systemInfo.result()?.explored}
                fallback={
                    <InfoDisplay
                        title="System not explored"
                        actions={
                            <Button color="primary" loading={explore.isLoading()} onClick={onExploreClick}>
                                Explore
                            </Button>
                        }
                    >
                        This system hasn't been explored yet. To explore it, click the button!
                    </InfoDisplay>
                }
            >
                <DataTable columns={SURFACE_COLUMNS} rows={items()} stickLeft onRowClick={onRowClick} />
            </Show>
        </div>
    );
};
