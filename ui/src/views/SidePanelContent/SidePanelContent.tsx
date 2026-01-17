import { For, Show, type Component } from 'solid-js';
import {
    Button,
    Container,
    Spacer,
    SkeletonText,
    Text,
    PageHeader,
    PageHeaderTitle,
    PageHeaderIcon,
    InfoDisplay,
} from '@/atoms';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { IconDocument, IconEnvelope, IconExit, IconUser } from '@/icons';
import { useNow } from '@/lib/solid/useNow';
import { useAuth } from '@/store/auth';
import { dfCompaniesByOwnerId, dfMe } from '@/store/datafront';
import { CompanyCard } from '@/components/CompanyCard/CompanyCard';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { useNavigate } from '@solidjs/router';
import { companyRoute } from '@/routes/misc';

export const SidePanelContent: Component = () => {
    const { logout } = useAuth();
    const me = dfMe.use();
    const now = useNow();
    const navigate = useNavigate();

    const userCompanies = dfCompaniesByOwnerId.use(() => (me.value() ? { ownerId: me.value()!.user.id } : null));

    return (
        <Container hasGap padded fullHeight direction="column">
            <Container hasGap direction="row">
                <IconUser size={32} />
                <Container hasGap direction="column" stretch>
                    <Text bold size="h3">
                        <Show when={me.value()} fallback={<SkeletonText />}>
                            {me.value()?.user.username}
                        </Show>
                    </Text>
                    <Text>
                        Registered{' '}
                        <Show when={me.value()} fallback={<SkeletonText />}>
                            {me.value()?.user.created.toLocaleDateString()}
                        </Show>
                    </Text>
                </Container>
                <Button square style="text" onClick={logout}>
                    <IconExit size={32} />
                </Button>
            </Container>

            <For each={Object.values(userCompanies.result())} fallback={<CompanyCard company={null} isLoading />}>
                {(c) => (
                    <CompanyCard
                        company={c}
                        onClick={(ev) => {
                            emulateLinkClick(
                                {
                                    href: companyRoute.render({ cid: c.id }),
                                    navigate,
                                },
                                ev,
                            );
                        }}
                    />
                )}
            </For>

            <PageHeader>
                <PageHeaderTitle>Inbox</PageHeaderTitle>
                <PageHeaderIcon icon={IconEnvelope} text="0" />
                <PageHeaderIcon icon={IconDocument} text="0" />
            </PageHeader>

            <InfoDisplay title="Empty">There are no pending contracts or unread messages left.</InfoDisplay>

            <Spacer />
            <div>
                Expansion v0.0.1 &bull; <GameTimeLabel value={now()} mode="gameAbsolute" gameTimeWithHours />
            </div>
        </Container>
    );
};
