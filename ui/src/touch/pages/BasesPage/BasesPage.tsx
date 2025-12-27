import { type Component } from 'solid-js';
import { PageHeader, PageHeaderIcon, PageHeaderTitle } from '@/atoms';
import { IconFlag } from '@/icons';
import { dfBaseOverviewsByCompanyId, useOwnCompanies } from '@/store/datafront';
import { BasesTable } from '../../../views/BasesTable/BasesTable';

export const BasesPage: Component = () => {
    const userCompanies = useOwnCompanies();
    const bases = dfBaseOverviewsByCompanyId.use(() => {
        const companies = userCompanies.result();
        const ids = Object.keys(companies);
        if (!ids.length) {
            return null;
        }

        return { companyId: companies[ids[0]].id };
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Company Bases</PageHeaderTitle>
                <PageHeaderIcon
                    icon={IconFlag}
                    text={Object.keys(bases.result()).length.toString()}
                    isTextLoading={bases.isLoading()}
                    loadingSkeletonLength={2}
                />
            </PageHeader>
            <BasesTable bases={bases} empty="You haven't established any bases yet" />
        </>
    );
};
