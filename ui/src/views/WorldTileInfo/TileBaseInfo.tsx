import { createMemo, Show, type Component } from 'solid-js';
import {
    DefinitionList,
    PageHeader,
    PageHeaderIcon,
    PageHeaderTitle,
    type DefinitionListItem,
    Link,
    PageHeaderActions,
    Button,
} from '@/atoms';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import type { Company } from '@/domain/Company';
import { World } from '@/domain/World';
import { IconEye, IconFlag } from '@/icons';
import { useSingleEntity } from '@/lib/datafront/utils';
import { getExploreRoute, useExploreRouteInfo } from '@/routes/explore';
import { dfBasesByLocation, dfCities, dfCompanies, useOwnCompanies } from '@/store/datafront';
import { UserLink } from '../UserLink/UserLink';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { getBasesRoute } from '@/routes/bases';
import { useNavigate } from '@solidjs/router';

type BaseInfo = {
    established: Date;
    operator: Company;
    isOwn: boolean;
    city: {
        name: string;
        url: string;
    };
};

const DEF_ITEMS: DefinitionListItem<BaseInfo>[] = [
    {
        title: 'Operator',
        // TODO: create and use CompanyDisplay component
        render: (base) => base.operator.name,
    },
    {
        title: 'Owner',
        render: (base) => <UserLink id={base.operator.ownerId} />,
    },
    {
        title: 'Established',
        render: (base) => <GameTimeLabel value={base.established} />,
    },
    {
        title: 'City',
        render: (base) => <Link href={base.city.url}>{base.city.name}</Link>,
    },
];

export const TileBaseInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const navigate = useNavigate();

    const bases = dfBasesByLocation.use(() => {
        const info = routeInfo();
        if (!info.tileId || !info.objectId) {
            return null;
        }

        return {
            tileId: World.parseTileId(info.tileId)!,
            worldId: info.objectId,
        };
    });

    const base = useSingleEntity(bases);
    const operator = dfCompanies.useSingle(() => base()?.operator ?? null);
    const city = dfCities.useSingle(() => base()?.cityId ?? null);
    const companies = useOwnCompanies();

    const baseInfo = createMemo((): BaseInfo | null => {
        const baseData = base();
        const operatorData = operator.result();
        const cityData = city.result();
        if (!baseData || !operatorData || !cityData) {
            return null;
        }

        const ownCompaniesIds = Object.values(companies.result()).map((c) => c.id);
        const isOwn = ownCompaniesIds.includes(baseData.operator);

        return {
            established: baseData.created,
            operator: operatorData,
            isOwn,
            city: {
                name: cityData.name,
                url: getExploreRoute({
                    objectId: baseData.worldId,
                    tab: cityData.centerTileId,
                }),
            },
        };
    });

    return (
        <Show when={base()}>
            <PageHeader>
                <PageHeaderTitle>Base</PageHeaderTitle>
                <PageHeaderIcon icon={IconFlag} />
                <Show when={baseInfo()?.isOwn}>
                    <PageHeaderActions pushRight>
                        <Button
                            square
                            style="light"
                            onClick={(ev) =>
                                emulateLinkClick(
                                    {
                                        href: getBasesRoute({ worldId: base()!.worldId, tileId: base()!.tileId }),
                                        navigate,
                                    },
                                    ev,
                                )
                            }
                        >
                            <IconEye size={32} block />
                        </Button>
                    </PageHeaderActions>
                </Show>
            </PageHeader>
            <DefinitionList items={DEF_ITEMS} value={baseInfo()} isLoading={bases.isLoading()} />
        </Show>
    );
};
