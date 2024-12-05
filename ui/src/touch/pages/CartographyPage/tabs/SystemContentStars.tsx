import { type Component, createMemo } from 'solid-js';
import { DataTable, type DataTableColumn } from '../../../../components/DataTable';
import { useExploreRouteInfo } from '../../../../routes/explore';
import { useSystemContent } from '../../../../store/galaxy';
import { type Star } from '../../../../domain/Star';
import { CelestialBodyTitle } from '../../../../components/CelestialBodyTitle/CelestialBodyTitle';
import { IconRadius, IconStar, IconTemperature, IconUnknown } from '../../../../icons';
import { formatScalar } from '../../../../lib/strings';

const COLUMNS: DataTableColumn<Star>[] = [
    {
        header: 'Star',
        width: 120,
        content: (row) => <CelestialBodyTitle id={row.id} icon={IconStar} />,
    },
    {
        header: { icon: IconTemperature },
        align: 'right',
        content: (row) => formatScalar(row.tempK, { noShortenings: true, unit: 'K', digits: 0 }),
    },
    {
        header: 'M',
        align: 'right',
        content: (row) => formatScalar(row.massSuns, { noShortenings: true, unit: '☉', digits: 1 }),
    },
    {
        header: { icon: IconStar },
        align: 'right',
        content: (row) => formatScalar(row.luminositySuns, { noShortenings: true, unit: '☉', digits: 1 }),
    },
    {
        header: { icon: IconRadius },
        align: 'right',
        content: (row) => formatScalar(row.radiusAu, { noShortenings: true, unit: 'au', digits: 2 }),
    },
    {
        header: { icon: IconUnknown },
        align: 'right',
        content: (row) => formatScalar(row.ageBillionYears, { noShortenings: true, unit: 'byrs', digits: 1 }),
    },
];

export const SystemContentStars: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const sc = useSystemContent(() => routeInfo().objectId);

    const rows = createMemo(() => sc.data?.stars ?? []);

    return <DataTable rows={rows()} columns={COLUMNS} stickLeft defaultColumnWidth={64} />;
};
