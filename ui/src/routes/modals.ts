import { useSearchParams, useNavigate } from '@solidjs/router';

export type ModalRouteState = {
    isOpen: () => boolean;
    open: () => void;
    close: () => void;
};

type ModalSearchParams = {
    modal?: string;
};

export function useModalRouteState(modalName: string): ModalRouteState {
    const [searchParams, setSearchParams] = useSearchParams<ModalSearchParams>();
    const navigate = useNavigate();

    // TODO: come up with a better and more complete solution
    let canGoBackToClose = false;

    return {
        isOpen: () => searchParams.modal === modalName,
        open: () => {
            setSearchParams({ modal: modalName });
            canGoBackToClose = true;
        },
        close: () => {
            if (searchParams.modal === modalName && canGoBackToClose) {
                navigate(-1);
                return;
            }

            setSearchParams({ modal: undefined }, { replace: true });
        },
    };
}
