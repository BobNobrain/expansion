import type { BaseContent } from '@/domain/Base';
import { World } from '@/domain/World';
import { useSingleEntity } from '@/lib/datafront/utils';
import { useTileBaseRouteInfo } from '@/routes/bases';
import { dfBasesByLocation } from '@/store/datafront';

export function useBase(): () => BaseContent | null {
    const routeInfo = useTileBaseRouteInfo();
    const bases = dfBasesByLocation.use(() => {
        const info = routeInfo();
        return {
            tileId: World.parseTileId(info.tileId)!,
            worldId: info.worldId,
        };
    });

    const base = useSingleEntity(bases);
    return base;
}
