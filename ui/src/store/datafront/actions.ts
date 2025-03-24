import { createDatafrontAction } from '../../lib/datafront/action';
import {
    ActionExploreSystem,
    ActionExploreWorld,
    ActionFoundCity,
    type ExploreWorldPayload,
    type ExploreSystemPayload,
    type FoundCityPayload,
} from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';

export const dfExploreSystem = createDatafrontAction<ExploreSystemPayload>({ name: ActionExploreSystem, ws });
export const dfExploreWorld = createDatafrontAction<ExploreWorldPayload>({ name: ActionExploreWorld, ws });

export const dfFoundCity = createDatafrontAction<FoundCityPayload>({ name: ActionFoundCity, ws });
