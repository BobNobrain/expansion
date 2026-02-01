import { createMemo, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
    Badge,
    Button,
    Container,
    DefinitionList,
    Link,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
    SkeletonText,
    Spacer,
    Text,
    type DefinitionListItem,
} from '@/atoms';
import { FactoryStatusLabel } from '@/components/FactoryStatusLabel/FactoryStatusLabel';
import { StorageContent } from '@/components/StorageContent/StorageContent';
import { Factory } from '@/domain/Base';
import { Storage } from '@/domain/Inventory';
import { World } from '@/domain/World';
import { IconArea, IconEquipment, IconPencil, IconTrashBin } from '@/icons';
import { buildingsAsset } from '@/lib/assetmanager';
import { formatNumericId } from '@/lib/id';
import { useAsset } from '@/lib/solid/asset';
import { formatInteger } from '@/lib/strings';
import { getBasesRoute } from '@/routes/bases';
import { useModalRouteState } from '@/routes/modals';
import { TouchModal } from '@/touch/components/TouchModal';
import { DemolishFactoryForm } from '@/views/DemolishFactoryForm/DemolishFactoryForm';
import { RenameFactoryForm } from '@/views/RenameFactoryForm/RenameFactoryForm';
import { useFactoryDisplayContext } from '../state';

type FactoryInfo = {
    factory: Factory;
    area: number | undefined;
    upgradeArea: number | undefined;
    worldId: string | null;
    tileId: string | null;

    onUpgradeClick: (f: Factory, ev: MouseEvent) => void;
};

const DEFS: DefinitionListItem<FactoryInfo>[] = [
    {
        title: 'Name',
        render: ({ factory }) => factory.name,
    },
    {
        title: 'Status',
        render: ({ factory }) => <FactoryStatusLabel factory={factory} />,
    },
    {
        title: 'License',
        render: ({ factory }) => formatNumericId(factory.id, { prefix: 'F-', length: 7 }),
    },
    {
        title: 'Base',
        render: ({ worldId, tileId }) => (
            <Show when={worldId && tileId} fallback={<SkeletonText length={11} />}>
                <Link href={getBasesRoute({ worldId: worldId!, tileId: tileId! })}>
                    {World.formatGalacticTileId(worldId!, tileId!)}
                </Link>
            </Show>
        ),
    },
    {
        title: 'Content',
        render: ({ factory, area }) => (
            <Container direction="row">
                <Badge style="transparent" iconLeft={IconEquipment}>
                    {formatInteger(Factory.getTotalEquipmentCount(Factory.getCurrentConfiguration(factory)))}
                </Badge>
                <Badge style="transparent" iconLeft={IconArea}>
                    <Show when={area === undefined} fallback={formatInteger(area!)}>
                        <SkeletonText length={3} />
                    </Show>
                </Badge>
            </Container>
        ),
    },
    {
        title: 'Upgrade',
        render: ({ factory, area, upgradeArea, onUpgradeClick }) => {
            return (
                <Container direction="row" secondaryAlignment="center">
                    <Show when={Factory.hasUpgradePlanned(factory)} fallback={<Text color="dim">Not planned</Text>}>
                        <Badge style="transparent" iconLeft={IconEquipment}>
                            {formatInteger(Factory.getTotalEquipmentCount(Factory.getUpgradeConfiguration(factory)))}
                        </Badge>
                        <Badge style="transparent" iconLeft={IconArea}>
                            <Show
                                when={area !== undefined && upgradeArea !== undefined}
                                fallback={<SkeletonText length={3} />}
                            >
                                <Text>{formatInteger(upgradeArea!)}</Text>
                            </Show>
                        </Badge>
                    </Show>
                    <Spacer />
                    <Button style="light" onClick={(ev) => onUpgradeClick(factory, ev)}>
                        <Show when={Factory.hasUpgradePlanned(factory)} fallback="Create">
                            Show
                        </Show>
                    </Button>
                </Container>
            );
        },
    },
];

export const FactoryDisplayOverview: Component = () => {
    const { factory, isLoading, worldId, tileId, onUpgrade } = useFactoryDisplayContext();
    const navigate = useNavigate();
    const buildings = useAsset(buildingsAsset);

    const info = createMemo((): FactoryInfo | null => {
        const f = factory();
        if (!f) {
            return null;
        }

        const buildingsData = buildings();

        return {
            factory: f,
            area: buildingsData ? Factory.getTotalArea(buildingsData, Factory.getCurrentConfiguration(f)) : undefined,
            upgradeArea: buildingsData
                ? Factory.getTotalArea(buildingsData, Factory.getUpgradeConfiguration(f))
                : undefined,
            worldId: worldId(),
            tileId: tileId(),

            onUpgradeClick: onUpgrade,
        };
    });

    const storage = createMemo(() => {
        const f = factory();
        if (!f) {
            return null;
        }

        const wid = worldId();
        if (!wid) {
            return null;
        }

        const tid = tileId();
        if (!tid) {
            return null;
        }

        return Storage.fromFactory(f, { worldId: wid, tileId: tid });
    });

    const renameModal = useModalRouteState('renameFactory');
    const demolishModal = useModalRouteState('demolishFactory');

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Overview</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button square style="light" onClick={renameModal.open}>
                        <IconPencil size={32} />
                    </Button>
                    <Button square style="light" onClick={demolishModal.open}>
                        <IconTrashBin size={32} color="error" />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <DefinitionList inset items={DEFS} value={info()} isLoading={factory() === null} />

            <StorageContent inset storage={storage()} isLoading={isLoading()} allowTransfer />

            <TouchModal isOpen={renameModal.isOpen()} onClose={renameModal.close} title="Rename">
                <RenameFactoryForm
                    factoryId={factory()?.id}
                    currentName={factory()?.name}
                    onSuccess={renameModal.close}
                    onCancel={renameModal.close}
                />
            </TouchModal>
            <TouchModal isOpen={demolishModal.isOpen()} onClose={demolishModal.close} title="Demolish Factory">
                <DemolishFactoryForm
                    factoryId={factory()?.id}
                    factoryData={{
                        worldId: worldId() ?? undefined,
                        tileId: tileId() ?? undefined,
                    }}
                    onSuccess={({ worldId, tileId }) => {
                        console.log('ONSUCCESS', worldId, tileId);
                        // demolishModal.close();
                        navigate(getBasesRoute({ worldId, tileId }), { replace: true });
                    }}
                    onCancel={demolishModal.close}
                />
            </TouchModal>
        </>
    );
};
