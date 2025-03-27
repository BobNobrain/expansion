import { type Component, createMemo, Show } from 'solid-js';
import { type ResourceDeposit, type World } from '../../domain/World';
import { IconRocks } from '../../icons';
import type { UseTableSingleResult } from '../../lib/datafront/types';
import { formatScalar } from '../../lib/strings';
import { CommodityIcon } from '../CommodityIcon';
import { DataTable, type DataTableColumn } from '../DataTable';
import { InlineLoader } from '../InlineLoader/InlineLoader';
import { PageHeader, PageHeaderTitle, PageHeaderIcon } from '../PageHeader';

const RESOURCE_COLUMNS: DataTableColumn<ResourceDeposit>[] = [
    {
        content: (row) => <CommodityIcon resource={row.resource} />,
        width: 48,
    },
    {
        header: 'Resource',
        content: 'resource',
    },
    {
        header: 'Quality',
        width: 100,
        align: 'right',
        content: (row) =>
            formatScalar(row.abundance * 100, {
                digits: 1,
                unit: '%',
                noShortenings: true,
            }),
    },
];

type Props = {
    world: UseTableSingleResult<World>;
    tileId: string | undefined;
    tileIndex: number | undefined;
};

export const TileResources: Component<Props> = (props) => {
    const resourceRows = createMemo(() => {
        const worldData = props.world.result();
        const tileId = props.tileId;
        const tileIndex = props.tileIndex;
        if (!worldData || !tileId || tileIndex === undefined) {
            return [];
        }

        return worldData.resources[tileIndex] ?? [];
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Resource Deposits</PageHeaderTitle>
                <Show when={props.world.result()}>
                    <PageHeaderIcon icon={IconRocks} text={resourceRows().length.toString()} />
                </Show>
            </PageHeader>
            <DataTable columns={RESOURCE_COLUMNS} rows={resourceRows()}>
                <Show when={props.world.isLoading()} fallback="No resource deposits on this plot">
                    <InlineLoader />
                </Show>
            </DataTable>
        </>
    );
};
