import { type Component, createMemo, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { CommodityIconWithLabel } from '../CommodityIcon';
import { DataTable, type DataTableColumn } from '../DataTable';
import { InlineLoader } from '../InlineLoader/InlineLoader';
import { World } from '../../domain/World';
import { IconPlot, IconRocks } from '../../icons';
import { formatScalar } from '../../lib/strings';
import { getExploreRoute, useExploreRouteObjectId } from '../../routes/explore';
import { dfWorlds } from '../../store/datafront';
import { Container } from '../Container/Container';
import { PageHeader, PageHeaderTitle } from '../PageHeader';
import { Badge } from '../Badge/Badge';

type ResourceRow = {
    tileId: string;
    resource: string;
    abundance: number;
};

const COLUMNS: DataTableColumn<ResourceRow>[] = [
    {
        header: { text: 'Resource' },
        content: (row) => <CommodityIconWithLabel resource={row.resource} />,
    },
    {
        header: { text: 'Quality' },
        width: 80,
        align: 'right',
        content: (row) =>
            formatScalar(row.abundance * 100, {
                digits: 1,
                unit: '%',
                noShortenings: true,
            }),
    },
    {
        header: { icon: IconPlot },
        width: 64,
        content: (row) => row.tileId,
    },
];

export const WorldResources: Component = () => {
    const worldId = useExploreRouteObjectId('world');
    const world = dfWorlds.useSingle(worldId);
    const navigate = useNavigate();

    const rows = createMemo<ResourceRow[]>(() => {
        const data = world.result();
        if (!data) {
            return [];
        }

        const rows: ResourceRow[] = Object.keys(data.resources).flatMap((tileIndexStr) => {
            const tileIndex = Number.parseInt(tileIndexStr, 10);
            const tileId = World.makeTileId(tileIndex);
            const deposits = data.resources[tileIndex];

            return deposits.map((deposit) => ({ tileId, ...deposit }));
        });

        rows.sort((r1, r2) => r2.abundance - r1.abundance);

        return rows;
    });

    const handleRowClick = (row: ResourceRow) => {
        navigate(getExploreRoute({ objectId: worldId()!, tab: row.tileId }));
    };

    return (
        <Container direction="column">
            <PageHeader>
                <PageHeaderTitle>All Deposits</PageHeaderTitle>
                <Show when={!world.isLoading()}>
                    <Badge iconLeft={IconRocks} style="trasparent">
                        {rows().length}
                    </Badge>
                </Show>
            </PageHeader>
            <DataTable columns={COLUMNS} rows={rows()} onRowClick={handleRowClick}>
                <Show when={world.isLoading()} fallback="No resource deposits on this world">
                    <InlineLoader />
                </Show>
            </DataTable>
        </Container>
    );
};
