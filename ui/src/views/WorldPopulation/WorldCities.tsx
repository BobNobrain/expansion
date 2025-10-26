import { type Component, createMemo, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    DataTable,
    type DataTableColumn,
    InlineLoader,
    PageHeader,
    PageHeaderIcon,
    PageHeaderTitle,
    Text,
} from '@/atoms';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { City } from '@/domain/City';
import { IconCalendar, IconCity, IconPeople } from '@/icons';
import { type UseTableResult } from '@/lib/datafront/types';
import { type Predictable } from '@/lib/predictables';
import { useNow } from '@/lib/solid/useNow';
import { formatInteger } from '@/lib/strings';
import { getExploreRoute, useExploreRouteObjectId } from '@/routes/explore';
import { dfUsers } from '@/store/datafront';

export type CityRow = {
    centerTile: string;
    name: string;
    founded: {
        at: Date;
        byUsername: string;
        byId: string;
    };
    population: Predictable;
};

const getNow = useNow();

const COLUMNS: DataTableColumn<CityRow>[] = [
    {
        header: { icon: IconCity, text: 'City' },
        content: (row) => <Text color="bright">{row.name}</Text>,
    },
    {
        header: { icon: IconPeople },
        width: 64,
        align: 'right',
        content: (row) => {
            return formatInteger(row.population.predict(getNow()));
        },
    },
    {
        header: { icon: IconCalendar, text: 'Founded' },
        width: 128,
        content: (row) => <GameTimeLabel color="bright" value={row.founded.at} />,
    },
];

type Props = {
    cities: UseTableResult<City>;
};

export const WorldCities: Component<Props> = (props) => {
    const navigate = useNavigate();
    const worldId = useExploreRouteObjectId('world');

    const users = dfUsers.useMany(() => Object.values(props.cities.result()).map((city) => city.founder));

    const rows = createMemo<CityRow[]>(() => {
        const cities = Object.values(props.cities.result());
        if (!cities) {
            return [];
        }

        const resolvedUsers = users.result();

        return cities.map((city) => {
            return {
                centerTile: city.centerTileId,
                name: city.name,
                population: City.getTotalPopulation(city),
                founded: {
                    at: city.established,
                    byId: city.founder,
                    byUsername: resolvedUsers[city.founder]?.username ?? 'loading...',
                },
            };
        });
    });

    const handleRowClick = (row: CityRow) => {
        navigate(getExploreRoute({ objectId: worldId()!, tab: row.centerTile }));
    };

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>All Cities</PageHeaderTitle>
                <Show when={!props.cities.isLoading()}>
                    <PageHeaderIcon icon={IconCity} text={rows().length.toString()} />
                </Show>
            </PageHeader>
            <DataTable columns={COLUMNS} rows={rows()} onRowClick={handleRowClick}>
                <Show when={props.cities.isLoading()} fallback="No cities on this world">
                    <InlineLoader />
                </Show>
            </DataTable>
        </>
    );
};
