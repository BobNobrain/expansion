import { type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    Button,
    Container,
    DataTable,
    DefinitionList,
    PageHeader,
    PageHeaderActions,
    PageHeaderIcon,
    PageHeaderTitle,
    type DataTableColumn,
    type DefinitionListItem,
} from '@/atoms';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { OperationDisplay } from '@/components/OperationDisplay/OperationDisplay';
import type { Company } from '@/domain/Company';
import type { User } from '@/domain/User';
import { IconBriefcase, IconDocument, IconEnvelope, IconUser } from '@/icons';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { companyRoute, userRoute } from '@/routes/misc';
import { useRouteInfo } from '@/routes/utils';
import { dfCompaniesByOwnerId, dfUsers } from '@/store/datafront';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';

const USER_DEFS: DefinitionListItem<User>[] = [
    {
        title: 'Username',
        render: 'username',
        skeletonLength: 10,
    },
    {
        title: 'Registered',
        render: ({ created }) => <GameTimeLabel value={created} />,
        skeletonLength: 20,
    },
];

const COMPANY_COLUMNS: DataTableColumn<Company>[] = [
    {
        header: { text: 'Name' },
        content: 'name',
        width: 150,
    },
    {
        header: { text: 'Created' },
        content: ({ created }) => <GameTimeLabel value={created} />,
        width: 120,
    },
];

export const UserPage: Component = () => {
    const routeInfo = useRouteInfo(userRoute);
    const navigate = useNavigate();

    const user = dfUsers.useSingle(() => routeInfo().uid || null);
    const userCompanies = dfCompaniesByOwnerId.use(() => ({ ownerId: routeInfo().uid }));

    return (
        <TouchContentSingle>
            <Container padded>
                <PageHeader>
                    <PageHeaderTitle>User Info</PageHeaderTitle>
                    <PageHeaderIcon icon={IconUser} />
                    <PageHeaderActions pushRight>
                        <Button square style="light">
                            <IconEnvelope size={32} />
                        </Button>
                        <Button square style="light">
                            <IconDocument size={32} />
                        </Button>
                    </PageHeaderActions>
                </PageHeader>
                <DefinitionList inset items={USER_DEFS} value={user.result()} isLoading={user.isLoading()} />

                <PageHeader>
                    <PageHeaderTitle>User Companies</PageHeaderTitle>
                    <PageHeaderIcon
                        icon={IconBriefcase}
                        isTextLoading={userCompanies.isLoading()}
                        text={Object.keys(userCompanies.result()).length.toString()}
                        loadingSkeletonLength={2}
                    />
                </PageHeader>

                <DataTable
                    inset
                    columns={COMPANY_COLUMNS}
                    rows={Object.values(userCompanies.result())}
                    onRowClick={(company, ev) => {
                        emulateLinkClick({ href: companyRoute.render({ cid: company.id }), navigate }, ev);
                    }}
                >
                    <OperationDisplay
                        title="No companies"
                        error={userCompanies.error()}
                        loading={userCompanies.isLoading()}
                    >
                        This user has not registered any companies yet.
                    </OperationDisplay>
                </DataTable>
            </Container>
        </TouchContentSingle>
    );
};
