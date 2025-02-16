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
import { getExploreRoute, useExploreRouteInfo, useExploreRouteObjectId } from '../../../../routes/explore';
import { CelestialBodyTitle } from '../../../../components/CelestialBodyTitle/CelestialBodyTitle';
import { DataTable, type DataTableColumn } from '../../../../components/DataTable';
import { dfExploreSystem, dfSystems, dfWorldOverviewsBySystemId } from '../../../../store/datafront';
import { Button } from '../../../../components/Button/Button';
import { InfoDisplay } from '../../../../components/InfoDisplay/InfoDisplay';
import { OperationDisplay } from '../../../../components/OperationDisplay/OperationDisplay';
import { SkeletonText } from '../../../../components/Skeleton';

type BodyClass = WorldClass | 'moon';

type TableRow = (WorldOverview & { isLoading?: undefined }) | { id: string; isLoading: true };

const iconsByPlanetType: { [key in BodyClass]?: Icon } = {
    terrestial: IconPlanet,
    gaseous: IconGasGiant,
    moon: IconMoon,
};

const fakeNames: Record<string, string | undefined> = {
    'OT-056a': 'Sigismundo',
    'OT-056c': 'Khasee',
};

const WORLDS_COLUMNS: DataTableColumn<TableRow>[] = [
    {
        header: 'Planet',
        content: (row) => {
            if (row.isLoading) {
                return <CelestialBodyTitle name={row.id} id={row.id} icon={IconPlanet} />;
            }
            const isMoon = row.id.includes('_');
            const bodyClass = isMoon ? 'moon' : row.params.class;
            return <CelestialBodyTitle name={fakeNames[row.id]} id={row.id} icon={iconsByPlanetType[bodyClass]} />;
        },
        width: 120,
    },
    {
        header: { icon: IconPlot },
        content: (row) => {
            if (row.isLoading) {
                return <SkeletonText length={3} />;
            }
            return (row.isExplored ? '' : '~') + formatScalar(row.size, { digits: 0 });
        },
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconPeople },
        content: (row) => {
            if (row.isLoading) {
                return <SkeletonText length={3} />;
            }
            return row.isExplored ? '0' : '--';
        },
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconFlag },
        content: (row) => {
            if (row.isLoading) {
                return <SkeletonText length={2} />;
            }
            return row.isExplored ? '0' : '--';
        },
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconTemperature },
        content: (row) => {
            if (row.isLoading) {
                return <SkeletonText length={4} />;
            }
            return row.isExplored ? formatDegreesCelsius(row.surface.tempK, { unit: 'K' }) : '??';
        },
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconPressure },
        content: (row) => {
            if (row.isLoading) {
                return <SkeletonText length={4} />;
            }

            if (row.isExplored) {
                return formatScalar(row.surface.pressureBar, { unit: 'bar', noShortenings: true, digits: 0 });
            }
            return '??';
        },
        width: 64,
        align: 'right',
    },
    {
        header: { icon: IconG },
        content: (row) => {
            if (row.isLoading) {
                return <SkeletonText length={4} />;
            }
            if (row.isExplored) {
                return formatScalar(row.surface.g, { unit: 'g', noShortenings: true, digits: 1 });
            }
            return '??';
        },
        width: 64,
        align: 'right',
    },
];

export const SystemContentPlanets: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const navigate = useNavigate();

    const systemId = useExploreRouteObjectId('system');

    const systemInfo = dfSystems.useSingle(systemId);
    const worldOverviews = dfWorldOverviewsBySystemId.use(() => {
        const id = systemId();
        return id ? { systemId: id } : null;
    });

    const items = createMemo<TableRow[]>(() => {
        const sysInfo = systemInfo.result();
        console.log('SYS INFO', sysInfo);
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
                rows.push({ id: orbit.bodyId, isLoading: true });
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

    const explore = dfExploreSystem.use(() => routeInfo().objectId!);
    const onExploreClick = () => {
        const id = systemId();
        if (!id) {
            return;
        }
        explore.run({ systemId: id });
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
                <OperationDisplay
                    error={worldOverviews.error() ?? systemInfo.error()}
                    loading={worldOverviews.isLoading() || systemInfo.isLoading()}
                    title="Could not load system data"
                >
                    <DataTable columns={WORLDS_COLUMNS} rows={items()} stickLeft onRowClick={onRowClick} />
                </OperationDisplay>
            </Show>
        </div>
    );
};
