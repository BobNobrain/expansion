import type { Component } from 'solid-js';
import { DefinitionList, PageHeader, PageHeaderIcon, PageHeaderTitle, type DefinitionListItem } from '@/atoms';
import { CompanyLogo } from '@/components/CompanyLogo/CompanyLogo';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import type { Company } from '@/domain/Company';
import { IconBriefcase } from '@/icons';
import { companyRoute } from '@/routes/misc';
import { useRouteInfo } from '@/routes/utils';
import { dfCompanies } from '@/store/datafront';
import { TouchContentDouble } from '@/touch/components/TouchContentDouble/TouchContentDouble';
import { UserLink } from '@/views/UserLink/UserLink';

const COMPANY_DEFS: DefinitionListItem<Company>[] = [
    {
        title: 'Name',
        render: 'name',
        skeletonLength: 10,
    },
    {
        title: 'Registered',
        render: ({ created }) => <GameTimeLabel value={created} />,
        skeletonLength: 20,
    },
    {
        title: 'Owner',
        render: ({ ownerId }) => <UserLink id={ownerId} />,
        skeletonLength: 20,
    },
];

export const CompanyPage: Component = () => {
    const routeInfo = useRouteInfo(companyRoute);
    const company = dfCompanies.useSingle(() => routeInfo().cid || null);

    return (
        <TouchContentDouble
            display={
                <CompanyLogo
                    value={company.result()?.logo}
                    isLoading={company.isLoading()}
                    companyName={company.result()?.name ?? null}
                />
            }
            height="l"
            initiallyExpanded
        >
            <PageHeader>
                <PageHeaderTitle>Company</PageHeaderTitle>
                <PageHeaderIcon icon={IconBriefcase} />
            </PageHeader>

            <DefinitionList items={COMPANY_DEFS} value={company.result()} isLoading={company.isLoading()} />
        </TouchContentDouble>
    );
};
