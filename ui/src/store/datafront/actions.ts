import { createDatafrontAction } from '../../lib/datafront/action';
import {
    ActionExploreSystem,
    ActionExploreWorld,
    type ExploreWorldPayload,
    type ExploreSystemPayload,
} from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';

export const dfExploreSystem = createDatafrontAction<ExploreSystemPayload>({ name: ActionExploreSystem, ws });
export const dfExploreWorld = createDatafrontAction<ExploreWorldPayload>({ name: ActionExploreWorld, ws });
