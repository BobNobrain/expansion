import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    Button,
    DataTable,
    type DataTableColumn,
    DefinitionList,
    type DefinitionListItem,
    InfoDisplay,
    Link,
    PageHeader,
    PageHeaderActions,
    PageHeaderIcon,
    PageHeaderTitle,
    SkeletonText,
} from '@/atoms';
import { FactoryStatusLabel } from '@/components/FactoryStatusLabel/FactoryStatusLabel';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { Factory, type BaseContent } from '@/domain/Base';
import { IconArea, IconEquipment, IconFactory, IconPlus } from '@/icons';
import { buildingsAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { formatInteger } from '@/lib/strings';
import { getExploreRoute } from '@/routes/explore';
import { factoryViewRoute } from '@/routes/factories';
import { dfCreateFactory, dfFactoriesByBaseId } from '@/store/datafront';
import { useBase } from '../hooks';
import { formatNumericId } from '@/lib/id';
import { OperationDisplay } from '@/components/OperationDisplay/OperationDisplay';

const DEFS: DefinitionListItem<BaseContent>[] = [
    {
        title: 'Location',
        skeletonLength: 25,
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
        skeletonLength: 23,
        render: (value) => <GameTimeLabel value={value.created} />,
    },
    {
        title: 'Registration',
        skeletonLength: 10,
        render: (value) => formatNumericId(value.id, { prefix: 'B-', length: 6 }),
    },
];

export const TileBaseOverview: Component = () => {
    const navigate = useNavigate();
    const { base, isLoading, error } = useBase();

    const factories = dfFactoriesByBaseId.use(() => {
        const baseId = base()?.id;
        return baseId ? { baseId } : null;
    });

    const createFactory = dfCreateFactory.use(() => Object.keys(factories).length.toString());
    const onCreateFactoryClick = () => {
        const baseId = base()?.id;
        if (!baseId) {
            return;
        }

        createFactory.run({ baseId });
    };

    const buildings = useAsset(buildingsAsset);

    const COLUMNS: DataTableColumn<Factory>[] = [
        {
            header: { text: 'Status' },
            width: 88,
            content: (factory) => <FactoryStatusLabel factory={factory} />,
        },
        {
            header: { icon: IconEquipment },
            align: 'right',
            width: 48,
            content: (factory) => formatInteger(Factory.getTotalEquipmentCount(factory)),
        },
        {
            header: { icon: IconArea },
            align: 'right',
            width: 48,
            content: (factory) => {
                return (
                    <Show when={buildings()} fallback={<SkeletonText length={3} />}>
                        {formatInteger(Factory.getTotalArea(buildings()!, factory))}
                    </Show>
                );
            },
        },
        {
            header: { text: 'Created' },
            content: (factory) => <GameTimeLabel value={factory.createdAt} />,
        },
    ];

    const totalAreaText = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return '0';
        }

        const fs = Object.values(factories.result());
        let total = 0;

        for (const f of fs) {
            total += Factory.getTotalArea(buildingsData, f);
        }

        return total.toString();
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Base Overview</PageHeaderTitle>
            </PageHeader>
            <Show
                when={isLoading() || base()}
                fallback={
                    <OperationDisplay title="Failed to load base" error={error()}>
                        The base you're looking for does not exist.
                    </OperationDisplay>
                }
            >
                <DefinitionList items={DEFS} value={base()} isLoading={isLoading()} />
            </Show>

            <PageHeader>
                <PageHeaderTitle>Factories</PageHeaderTitle>
                <PageHeaderIcon
                    icon={IconFactory}
                    text={Object.keys(factories.result()).length.toString()}
                    isTextLoading={factories.isLoading()}
                />
                <PageHeaderIcon
                    icon={IconArea}
                    text={totalAreaText()}
                    isTextLoading={factories.isLoading() || !buildings()}
                />
                <PageHeaderActions pushRight>
                    <Button
                        square
                        style="light"
                        loading={factories.isLoading() || createFactory.isLoading()}
                        onClick={onCreateFactoryClick}
                    >
                        <IconPlus size={32} block />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <DataTable
                rows={Object.values(factories.result())}
                columns={COLUMNS}
                onRowClick={(row, ev) => {
                    emulateLinkClick(
                        {
                            href: factoryViewRoute.render({ factoryId: row.id }),
                            navigate,
                        },
                        ev,
                    );
                }}
            >
                <InfoDisplay
                    title="No factories"
                    actions={
                        <Button
                            color="primary"
                            loading={factories.isLoading() || createFactory.isLoading()}
                            onClick={onCreateFactoryClick}
                        >
                            Create
                        </Button>
                    }
                ></InfoDisplay>
            </DataTable>
        </>
    );
};
