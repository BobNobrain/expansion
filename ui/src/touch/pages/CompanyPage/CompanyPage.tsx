import type { Component } from 'solid-js';
import {
    Container,
    DefinitionList,
    InfoDisplay,
    PageHeader,
    PageHeaderIcon,
    PageHeaderTitle,
    type DefinitionListItem,
} from '@/atoms';
import { CompanyLogo } from '@/components/CompanyLogo/CompanyLogo';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import type { Company } from '@/domain/Company';
import { IconBriefcase, IconFlag } from '@/icons';
import { companyRoute } from '@/routes/misc';
import { useRouteInfo } from '@/routes/utils';
import { dfBaseOverviewsByCompanyId, dfCompanies } from '@/store/datafront';
import { TouchContentDouble } from '@/touch/components/TouchContentDouble/TouchContentDouble';
import { UserLink } from '@/views/UserLink/UserLink';
import { BasesTable } from '@/views/BasesTable/BasesTable';

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

    const bases = dfBaseOverviewsByCompanyId.use(() => ({ companyId: routeInfo().cid }));

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
            <Container padded>
                <PageHeader>
                    <PageHeaderTitle>Company</PageHeaderTitle>
                    <PageHeaderIcon icon={IconBriefcase} />
                </PageHeader>

                <DefinitionList inset items={COMPANY_DEFS} value={company.result()} isLoading={company.isLoading()} />

                <PageHeader>
                    <PageHeaderTitle>Company Bases</PageHeaderTitle>
                    <PageHeaderIcon
                        icon={IconFlag}
                        text={Object.keys(bases.result()).length.toString()}
                        isTextLoading={bases.isLoading()}
                    />
                </PageHeader>
                <BasesTable
                    inset
                    bases={bases}
                    empty={
                        <InfoDisplay title="No bases">
                            This company has not established any bases anywhere in the universe.
                        </InfoDisplay>
                    }
                />
            </Container>
        </TouchContentDouble>
    );
};
