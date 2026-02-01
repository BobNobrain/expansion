import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    Button,
    Container,
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
    Text,
} from '@/atoms';
import { FactoryStatusLabel } from '@/components/FactoryStatusLabel/FactoryStatusLabel';
import { GameTimeLabel } from '@/components/GameTimeLabel/GameTimeLabel';
import { OperationDisplay } from '@/components/OperationDisplay/OperationDisplay';
import { Factory, type BaseContent } from '@/domain/Base';
import { IconArea, IconEquipment, IconFactory, IconPencil, IconPlus, IconTrashBin } from '@/icons';
import { buildingsAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { formatNumericId } from '@/lib/id';
import { formatInteger } from '@/lib/strings';
import { getExploreRoute } from '@/routes/explore';
import { factoryViewRoute } from '@/routes/factories';
import { useModalRouteState } from '@/routes/modals';
import { dfFactoriesByBaseId } from '@/store/datafront';
import { TouchModal } from '@/touch/components/TouchModal';
import { CreateFactoryForm } from '@/views/CreateFactoryForm/CreateFactoryForm';
import { RenameBaseForm } from '@/views/RenameBaseForm/RenameBaseForm';
import { useBase } from '../hooks';

const TileBaseName: Component<{ baseId: number; baseName: string }> = (props) => {
    const renameBaseModal = useModalRouteState('renameBase');

    return (
        <Container direction="row" hasGap size="s">
            <Text>{props.baseName}</Text>
            <Button style="text" square size="text" onClick={renameBaseModal.open}>
                <IconPencil size={20} />
            </Button>
            <TouchModal isOpen={renameBaseModal.isOpen()} onClose={renameBaseModal.close} title="Rename">
                <RenameBaseForm
                    baseId={props.baseId}
                    currentName={props.baseName}
                    onSuccess={renameBaseModal.close}
                    onCancel={renameBaseModal.close}
                />
            </TouchModal>
        </Container>
    );
};

const DEFS: DefinitionListItem<BaseContent>[] = [
    {
        title: 'Name',
        skeletonLength: 10,
        render: ({ id, name }) => <TileBaseName baseId={id} baseName={name} />,
    },
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

    const buildings = useAsset(buildingsAsset);

    const COLUMNS: DataTableColumn<Factory>[] = [
        {
            header: { text: 'Name' },
            width: 120,
            content: 'name',
        },
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
            width: 120,
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

    const createFactoryModal = useModalRouteState('createFactory');

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Base Overview</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    {/* <Button square style="light" onClick={renameBaseModal.open}>
                        <IconNametag size={32} />
                    </Button> */}
                    <Button square style="light">
                        <IconTrashBin size={32} color="error" />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <Show
                when={isLoading() || base()}
                fallback={
                    <OperationDisplay title="Failed to load base" error={error()}>
                        The base you're looking for does not exist.
                    </OperationDisplay>
                }
            >
                <DefinitionList inset items={DEFS} value={base()} isLoading={isLoading()} />
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
                    <Button square style="light" loading={factories.isLoading()} onClick={createFactoryModal.open}>
                        <IconPlus size={32} block />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <DataTable
                rows={Object.values(factories.result())}
                columns={COLUMNS}
                stickLeft
                inset
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
                        <Button color="primary" loading={factories.isLoading()} onClick={createFactoryModal.open}>
                            Create
                        </Button>
                    }
                >
                    This base does not have any factories built. You need to create a factory for the base to start
                    producing something.
                </InfoDisplay>
            </DataTable>

            <TouchModal isOpen={createFactoryModal.isOpen()} onClose={createFactoryModal.close} title="Create Factory">
                <CreateFactoryForm
                    baseId={base()?.id}
                    nFactoriesExisting={Object.keys(factories.result()).length}
                    onCancel={createFactoryModal.close}
                    onSuccess={createFactoryModal.close}
                />
            </TouchModal>
        </>
    );
};
