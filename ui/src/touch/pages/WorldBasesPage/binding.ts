import { useNavigate } from '@solidjs/router';
import { getUpperRoute, useBasesRouteInfo } from '@/routes/bases';
import { usePageContextBinding } from '@/touch/components/TouchPage';

export function useBasesPageContextBinding() {
    const routeInfo = useBasesRouteInfo();
    const navigate = useNavigate();

    const goBack = () => navigate(getUpperRoute(routeInfo()));

    usePageContextBinding(() => {
        const info = routeInfo();
        let title = 'All Bases';
        let subtitle: string | undefined;

        if (info.tileId) {
            title = 'Base';
            subtitle = `${info.worldId}#${info.tileId}`;
        } else if (info.worldId) {
            title = `World Bases`;
            subtitle = info.worldId;
        }

        return {
            title,
            subtitle,
            goBack,
        };
    });
}
