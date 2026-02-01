import { createDatafrontAction } from '@/lib/datafront/action';
import {
    type ExploreSystemPayload,
    ActionExploreSystem,
    type ExploreWorldPayload,
    ActionExploreWorld,
    type FoundCityPayload,
    ActionFoundCity,
    type CreateBasePayload,
    ActionCreateBase,
    type RemoveBasePayload,
    ActionRemoveBase,
    type RunCheatPayload,
    ActionRunCheat,
    type CreateFactoryPayload,
    ActionCreateFactory,
    type RebalanceFactoryPayload,
    ActionRebalanceFactory,
    type UpgradeFactoryPayload,
    ActionChangeUpgradeProject,
    type ContributeToFactoryPayload,
    ActionContributeToUpgrade,
    type TransferFactoryItemsPayload,
    ActionTransferFactoryItems,
    type RenameFactoryPayload,
    ActionRenameFactory,
    type RenameBasePayload,
    ActionRenameBase,
    type DemolishFactoryPayload,
    ActionDemolishFactory,
} from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';

export const dfExploreSystem = createDatafrontAction<ExploreSystemPayload>({ name: ActionExploreSystem, ws });
export const dfExploreWorld = createDatafrontAction<ExploreWorldPayload>({ name: ActionExploreWorld, ws });

export const dfFoundCity = createDatafrontAction<FoundCityPayload>({ name: ActionFoundCity, ws });

export const dfCreateBase = createDatafrontAction<CreateBasePayload>({ name: ActionCreateBase, ws });
export const dfRenameBase = createDatafrontAction<RenameBasePayload>({ name: ActionRenameBase, ws });
export const dfRemoveBase = createDatafrontAction<RemoveBasePayload>({ name: ActionRemoveBase, ws });

export const dfCreateFactory = createDatafrontAction<CreateFactoryPayload>({ name: ActionCreateFactory, ws });
export const dfRebalanceFactory = createDatafrontAction<RebalanceFactoryPayload>({ name: ActionRebalanceFactory, ws });
export const dfUpgradeFactory = createDatafrontAction<UpgradeFactoryPayload>({ name: ActionChangeUpgradeProject, ws });
export const dfContributeToFactory = createDatafrontAction<ContributeToFactoryPayload>({
    name: ActionContributeToUpgrade,
    ws,
});
export const dfTransferFactoryItems = createDatafrontAction<TransferFactoryItemsPayload>({
    name: ActionTransferFactoryItems,
    ws,
});
export const dfRenameFactory = createDatafrontAction<RenameFactoryPayload>({
    name: ActionRenameFactory,
    ws,
});
export const dfDemolishFactory = createDatafrontAction<DemolishFactoryPayload>({
    name: ActionDemolishFactory,
    ws,
});

export const dfRunCheat = createDatafrontAction<RunCheatPayload, unknown>({ name: ActionRunCheat, ws });
