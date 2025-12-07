import { createReaction, createSignal } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';

export type UseGoBackResult = {
    goBack: () => void;
    canGoBack: () => boolean;
};

export function useGoBack() {
    const [canGoBack, setCanGoBack] = createSignal(false);

    const track = createReaction(() => {
        setCanGoBack(true);
    });

    const navigate = useNavigate();
    const location = useLocation();

    track(() => {
        location.hash;
        location.key;
        location.pathname;
        location.query;
        location.search;
    });

    const goBack = () => navigate(-1);
    return { goBack, canGoBack };
}
