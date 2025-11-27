import { createDatafrontAction } from '@/lib/datafront/action';
import {
    ActionExploreSystem,
    type ExploreSystemPayload,
    ActionExploreWorld,
    type ExploreWorldPayload,
    ActionFoundCity,
    type FoundCityPayload,
    ActionCreateBase,
    type CreateBasePayload,
    type RunCheatPayload,
    ActionRunCheat,
    type CreateSitePayload,
    ActionCreateBaseSite,
    type ContributeToSitePayload,
    ActionContributeToSite,
} from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';

export const dfExploreSystem = createDatafrontAction<ExploreSystemPayload>({ name: ActionExploreSystem, ws });
export const dfExploreWorld = createDatafrontAction<ExploreWorldPayload>({ name: ActionExploreWorld, ws });

export const dfFoundCity = createDatafrontAction<FoundCityPayload>({ name: ActionFoundCity, ws });
export const dfCreateBase = createDatafrontAction<CreateBasePayload>({ name: ActionCreateBase, ws });
export const dfCreateBaseSite = createDatafrontAction<CreateSitePayload>({ name: ActionCreateBaseSite, ws });
export const dfContributeToBaseSite = createDatafrontAction<ContributeToSitePayload>({
    name: ActionContributeToSite,
    ws,
});

export const dfRunCheat = createDatafrontAction<RunCheatPayload, unknown>({ name: ActionRunCheat, ws });
