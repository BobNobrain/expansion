import { createMemo, type JSX, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { DataTable, type DataTableColumn, InlineLoader, SkeletonText } from '@/atoms';
import { CelestialBodyTitle } from '@/components/CelestialBodyTitle/CelestialBodyTitle';
import { type BaseContent } from '@/domain/Base';
import { type City } from '@/domain/City';
import { IconCity, IconFactory, IconFlag, IconPlanet } from '@/icons';
import { type UseTableResult } from '@/lib/datafront/types';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { formatInteger } from '@/lib/strings';
import { getBasesRoute } from '@/routes/bases';
import { dfCities } from '@/store/datafront';

export type BasesTableProps = {
    bases: UseTableResult<BaseContent>;
    empty?: JSX.Element;
};

type BasesListRow = {
    id: number;
    worldName: string | undefined;
    worldId: string;
    tileId: string;
    city: City | null;
    nFactories: number;
    url: string;
};

const BASES_COLUMNS: DataTableColumn<BasesListRow>[] = [
    {
        header: { icon: IconPlanet, text: 'Location' },
        width: 140,
        content: (row) => {
            return <CelestialBodyTitle id={row.worldId} name={row.worldName} tileId={row.tileId} icon={IconFlag} />;
        },
    },
    {
        header: { icon: IconCity, text: 'City' },
        content: (row) => {
            if (!row.city) {
                return <SkeletonText length={5} />;
            }

            return row.city.name;
        },
    },
    {
        header: { icon: IconFactory },
        width: 48,
        align: 'right',
        content: (row) => {
            return formatInteger(row.nFactories);
        },
    },
];

export const BasesTable: Component<BasesTableProps> = (props) => {
    const cities = dfCities.useMany(() => Object.values(props.bases.result()).map((base) => base.cityId));

    const basesList = createMemo((): BasesListRow[] =>
        Object.values(props.bases.result()).map((base) => {
            const loadedCities = cities.result();

            return {
                id: base.id,
                worldId: base.worldId,
                worldName: undefined,
                tileId: base.tileId,
                city: loadedCities[base.cityId] ?? null,
                nFactories: 0,
                url: getBasesRoute({ worldId: base.worldId, tileId: base.tileId }),
            };
        }),
    );

    const navigate = useNavigate();

    return (
        <DataTable
            columns={BASES_COLUMNS}
            rows={basesList()}
            onRowClick={(row, ev) => {
                emulateLinkClick({ href: getBasesRoute({ worldId: row.worldId, tileId: row.tileId }), navigate }, ev);
            }}
        >
            <Show when={props.bases.isLoading()} fallback={props.empty ?? 'Nothing to show'}>
                <InlineLoader />
            </Show>
        </DataTable>
    );
};
