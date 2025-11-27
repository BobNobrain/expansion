import { Badge, DataTable, InfoDisplay, PageHeader, PageHeaderTitle, type DataTableColumn } from '@/atoms';
import { wfIcons } from '@/components/WorkforceCounts/WorkforceCounts';
import { createMemo, type Component } from 'solid-js';
import { useFactoryDisplayContext } from '../state';
import { Factory } from '@/domain/Base';
import { useAsset } from '@/lib/solid/asset';
import { buildingsAsset } from '@/lib/assetmanager';
import { WorkforceData, type WorkforceType } from '@/domain/City';
import { formatInteger } from '@/lib/strings';

type Row = {
    wf: WorkforceType;
    jobs: number;
};

const COLUMNS: DataTableColumn<Row>[] = [
    {
        header: { text: 'Position' },
        content: (row) => (
            <Badge style="transparent" iconLeft={wfIcons[row.wf]}>
                {row.wf}
            </Badge>
        ),
    },
    {
        header: { text: 'Jobs' },
        width: 80,
        align: 'right',
        content: (row) => formatInteger(row.jobs),
    },
];

export const FactoryDisplayWorkforce: Component = () => {
    const { state } = useFactoryDisplayContext();
    const buildings = useAsset(buildingsAsset);

    const jobs = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return WorkforceData.filled(0);
        }

        console.log(Factory.getTotalJobs(buildingsData, { equipment: state.factoryEquipment }));
        return Factory.getTotalJobs(buildingsData, { equipment: state.factoryEquipment });
    });

    const rows = createMemo((): Row[] =>
        Object.entries(jobs()).map(
            ([wf, count]): Row => ({
                wf: wf as WorkforceType,
                jobs: count,
            }),
        ),
    );

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Jobs</PageHeaderTitle>
            </PageHeader>
            <DataTable columns={COLUMNS} rows={rows()}>
                <InfoDisplay title="No jobs">
                    This factory does not require workers and will not create jobs.
                </InfoDisplay>
            </DataTable>
        </>
    );
};
