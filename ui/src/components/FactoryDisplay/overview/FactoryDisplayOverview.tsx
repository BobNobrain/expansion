import { createMemo, Show, type Component } from 'solid-js';
import {
    Badge,
    Button,
    Container,
    DefinitionList,
    InfoDisplay,
    Link,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
    SkeletonText,
    Spacer,
    Text,
    type DefinitionListItem,
} from '@/atoms';
import { Factory } from '@/domain/Base';
import { World } from '@/domain/World';
import { FactoryStatusLabel } from '@/components/FactoryStatusLabel/FactoryStatusLabel';
import { InventoryTable, type InventoryEntry } from '@/components/Inventory';
import { IconArea, IconEquipment, IconTransfer } from '@/icons';
import { buildingsAsset } from '@/lib/assetmanager';
import { formatNumericId } from '@/lib/id';
import { calcPredictableStandartSpeed } from '@/lib/predictables';
import { useAsset } from '@/lib/solid/asset';
import { formatInteger } from '@/lib/strings';
import { getBasesRoute } from '@/routes/bases';
import { useFactoryDisplayContext } from '../state';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { inventoryTransferRoute } from '@/routes/transfer';
import { useNavigate } from '@solidjs/router';
import { Storage } from '@/domain/Inventory';

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

    const inventoryEntries = createMemo((): InventoryEntry[] => {
        const f = factory();
        if (!f) {
            return [];
        }

        const inv = f.inventory;
        const now = new Date(); // TODO: this is not reactive, which may cause issues later

        return Object.entries(inv).map(([cid, amount]): InventoryEntry => {
            return {
                commodity: cid,
                // TODO: get these values from API instead
                amount: amount,
                speed: calcPredictableStandartSpeed(amount, now),
            };
        });
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Overview</PageHeaderTitle>
            </PageHeader>
            <DefinitionList items={DEFS} value={info()} isLoading={factory() === null} />

            <PageHeader>
                <PageHeaderTitle>Inventory</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button
                        square
                        style="light"
                        loading={worldId() === null || tileId() === null || factory() === null}
                        onClick={(ev) => {
                            const wid = worldId();
                            if (!wid) {
                                return;
                            }

                            const tid = tileId();
                            if (!tid) {
                                return;
                            }

                            const fid = factory()?.id;
                            if (!fid) {
                                return;
                            }

                            const factoryLocation = World.formatGalacticTileId(wid, tid);
                            emulateLinkClick(
                                {
                                    href: inventoryTransferRoute.render(
                                        { location: factoryLocation },
                                        { sourceId: Storage.craftFactoryStorageId(fid) },
                                    ),
                                    navigate,
                                },
                                ev,
                            );
                        }}
                    >
                        <IconTransfer size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <InventoryTable entries={inventoryEntries()} loading={isLoading()} display="both">
                <InfoDisplay title="Nothing to show">
                    This factory does not produce or consume anything, and the storage is empty.
                </InfoDisplay>
            </InventoryTable>
        </>
    );
};
