import { createMemo, type Component } from 'solid-js';
import {
    Badge,
    Button,
    DefinitionList,
    type DefinitionListItem,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
} from '@/atoms';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { type BaseContent } from '@/domain/Base';
import { IconContext, IconHammer, IconPeople } from '@/icons';
import { useTileBaseRouteInfo } from '@/routes/bases';

const DEFS: DefinitionListItem<BaseContent>[] = [
    {
        title: 'Location',
        render: (value) => `${value.worldId}#${value.tileId}`,
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

    const base = createMemo(() => {
        const base: BaseContent = {
            id: 42,
            cityId: 1,
            worldId: routeInfo().worldId,
            tileId: routeInfo().tileId,
            created: new Date(),

            factories: [
                {
                    id: '1',
                    equipment: [
                        {
                            equipmentId: 'drill',
                            count: 2,
                            employees: { intern: 3, worker: 2 },
                            production: {},
                        },
                    ],
                },
            ],
            constructionSites: [],
        };

        return base;
    });

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
            <DefinitionList items={DEFS} value={base()} />;
        </>
    );
};
