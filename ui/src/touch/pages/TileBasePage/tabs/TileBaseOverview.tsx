import { type Component } from 'solid-js';
import {
    Badge,
    Button,
    DefinitionList,
    type DefinitionListItem,
    Link,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
} from '@/atoms';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { type BaseContent } from '@/domain/Base';
import { World } from '@/domain/World';
import { IconContext, IconHammer, IconPeople } from '@/icons';
import { useSingleEntity } from '@/lib/datafront/utils';
import { useTileBaseRouteInfo } from '@/routes/bases';
import { dfBasesByLocation } from '@/store/datafront';
import { getExploreRoute } from '@/routes/explore';

const DEFS: DefinitionListItem<BaseContent>[] = [
    {
        title: 'Location',
        render: (value) => {
            return (
                <Link
                    href={getExploreRoute({ objectId: value.worldId, tab: value.tileId })}
                >{`${value.worldId}#${value.tileId}`}</Link>
            );
        },
    },
    {
        title: 'Created',
        render: (value) => <GameTimeLabel value={value.created} />,
    },
    {
        title: 'Production',
        render: (value) => `${value.factories.length} factories`,
    },
    {
        title: 'Construction sites',
        render: (value) => `${value.constructionSites.length}`,
    },
    {
        title: 'Total Workforce',
        render: (value) => {
            let totalWorkers = 0;

            for (const f of Object.values(value.factories)) {
                for (const e of Object.values(f.equipment)) {
                    for (const n of Object.values(e.employees)) {
                        totalWorkers += n;
                    }
                }
            }

            return (
                <Badge iconLeft={IconPeople} style="transparent">
                    {totalWorkers}
                </Badge>
            );
        },
    },
];

export const TileBaseOverview: Component = () => {
    const routeInfo = useTileBaseRouteInfo();

    const bases = dfBasesByLocation.use(() => {
        const info = routeInfo();
        return {
            tileId: World.parseTileId(info.tileId)!,
            worldId: info.worldId,
        };
    });

    const base = useSingleEntity(bases);

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Base Overview</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button square style="light">
                        <IconHammer size={32} block />
                    </Button>
                    <Button square style="light">
                        <IconContext size={32} block />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <DefinitionList items={DEFS} value={base()} />
        </>
    );
};
