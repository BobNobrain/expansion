import { type Component } from 'solid-js';
import { PageHeader, PageHeaderIcon, PageHeaderTitle } from '@/atoms';
import { IconFlag } from '@/icons';
import { useBasesRouteInfo } from '@/routes/bases';
import { dfBasesByBranch, useOwnCompanies } from '@/store/datafront';
import { BasesTable } from '@/views/BasesTable/BasesTable';
import { useBasesPageContextBinding } from './binding';

export const WorldBasesPage: Component = () => {
    useBasesPageContextBinding();

    const routeInfo = useBasesRouteInfo();
    const userCompanies = useOwnCompanies();

    const bases = dfBasesByBranch.use(() => {
        const companies = userCompanies.result();
        const ids = Object.keys(companies);
        if (!ids.length) {
            return null;
        }

        const info = routeInfo();
        return {
            companyId: companies[ids[0]].id,
            worldId: info.worldId!,
        };
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Bases</PageHeaderTitle>
                <PageHeaderIcon icon={IconFlag} text={Object.keys(bases.result()).length.toString()} />
            </PageHeader>
            <BasesTable
                bases={bases}
                empty={`You haven't established any bases on ${routeInfo().worldId ?? 'this world'} yet`}
            />
        </>
    );
};
