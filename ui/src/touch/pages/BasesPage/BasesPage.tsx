import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    DataTable,
    type DataTableColumn,
    InlineLoader,
    PageHeader,
    PageHeaderIcon,
    PageHeaderTitle,
    SkeletonText,
} from '@/atoms';
import { CelestialBodyTitle } from '@/components/CelestialBodyTitle/CelestialBodyTitle';
import { type City } from '@/domain/City';
import { IconCity, IconFactory, IconFlag } from '@/icons';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { formatInteger } from '@/lib/strings';
import { getBasesRoute } from '@/routes/bases';
import { dfBasesByCompanyId, dfCities, useOwnCompanies } from '@/store/datafront';

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
        header: { text: 'Location' },
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
        content: (row) => {
            return formatInteger(row.nFactories);
        },
    },
];

export const BasesPage: Component = () => {
    const userCompanies = useOwnCompanies();
    const bases = dfBasesByCompanyId.use(() => {
        const companies = userCompanies.result();
        const ids = Object.keys(companies);
        if (!ids.length) {
            return null;
        }

        return { companyId: companies[ids[0]].id };
    });

    const cities = dfCities.useMany(() => Object.values(bases.result()).map((base) => base.cityId));

    const basesList = createMemo((): BasesListRow[] =>
        Object.values(bases.result()).map((base) => {
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
        <>
            <PageHeader>
                <PageHeaderTitle>Company Bases</PageHeaderTitle>
                <PageHeaderIcon
                    icon={IconFlag}
                    text={basesList().length.toString()}
                    isTextLoading={bases.isLoading()}
                    loadingSkeletonLength={2}
                />
            </PageHeader>
            <DataTable
                columns={BASES_COLUMNS}
                rows={basesList()}
                onRowClick={(row, ev) => {
                    emulateLinkClick(
                        { href: getBasesRoute({ worldId: row.worldId, tileId: row.tileId }), navigate },
                        ev,
                    );
                }}
            >
                <Show when={bases.isLoading()} fallback="You have not established any bases yet.">
                    <InlineLoader />
                </Show>
            </DataTable>
        </>
    );
};
