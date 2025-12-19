import { type Component, createMemo, Show } from 'solid-js';
import {
    DataTable,
    type DataTableColumn,
    InlineLoader,
    PageHeader,
    PageHeaderIcon,
    PageHeaderTitle,
    Text,
} from '@/atoms';
import { type City, WORKFORCE_TYPES, type WorkforceType } from '@/domain/City';
import { IconPeople } from '@/icons';
import { type UseTableResult } from '@/lib/datafront/types';
import { type Predictable, renderPredictableSpeed, sumPredictables } from '@/lib/predictables';
import { useNow } from '@/lib/solid/useNow';
import { formatInteger } from '@/lib/strings';

type Props = {
    cities: UseTableResult<City>;
};

type Row = {
    wfType: WorkforceType;
    amount: Predictable;
};

export const PopulationOverview: Component<Props> = (props) => {
    const totalPopCountsByType = createMemo(() => {
        const result = {} as Record<WorkforceType, Predictable>;
        const cities = Object.values(props.cities.result());
        if (!cities.length) {
            return null;
        }

        for (const wf of WORKFORCE_TYPES) {
            result[wf] = sumPredictables(cities.map((city) => city.population.counts[wf]));
        }

        return result;
    });

    const rows = createMemo(() => {
        const popCounts = totalPopCountsByType();
        if (!popCounts) {
            return [];
        }

        return WORKFORCE_TYPES.map((wf): Row => {
            return {
                wfType: wf,
                amount: popCounts[wf],
            };
        });
    });

    const now = useNow();

    const COLUMNS: DataTableColumn<Row>[] = [
        {
            header: { text: 'Qualification' },
            content: (row) => {
                return row.wfType;
            },
        },
        {
            header: { icon: IconPeople },
            width: 96,
            align: 'right',
            content: (row) => {
                const amount = row.amount.predict(now());
                return formatInteger(amount, { digits: 3 });
            },
        },
        {
            header: { text: '∆' },
            width: 96,
            align: 'right',
            content: (row) => {
                const speed = renderPredictableSpeed(row.amount, now());
                if (speed.startsWith('+')) {
                    return <Text color="success">{speed}</Text>;
                }
                if (speed === '--') {
                    return <Text>{speed}</Text>;
                }
                return <Text color="error">{speed}</Text>;
            },
        },
    ];

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Population</PageHeaderTitle>
                <PageHeaderIcon icon={IconPeople} />
            </PageHeader>
            <DataTable columns={COLUMNS} rows={rows()}>
                <Show when={props.cities.isLoading()} fallback="This world is not inhabited">
                    <InlineLoader />
                </Show>
            </DataTable>
        </>
    );
};
