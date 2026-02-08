import { createMemo, type Component } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
import { Button, InfoDisplay } from '@/atoms';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { isSetupRoute, setupRoute } from '@/routes/setup';
import { dfMe, useOwnCompanies } from '@/store/datafront';
import { TouchModal } from '../TouchModal';

export const TouchCompanySetupModal: Component = () => {
    const ownCompanies = useOwnCompanies();
    const me = dfMe.use();

    const navigate = useNavigate();
    const location = useLocation();
    const isWhitelistedRoute = createMemo(() => isSetupRoute(location.pathname));

    const isModalOpen = createMemo(() => {
        if (isWhitelistedRoute()) {
            return false;
        }

        if (me.isLoading()) {
            return false;
        }

        if (ownCompanies.isLoading()) {
            return false;
        }

        if (ownCompanies.error()) {
            return false;
        }

        return Object.keys(ownCompanies.result()).length === 0;
    });

    const usernameText = createMemo(() => {
        const user = me.value();
        if (!user) {
            return '';
        }

        return `, ${user.user.username}`;
    });

    return (
        <TouchModal top isOpen={isModalOpen()}>
            <InfoDisplay
                title="Welcome!"
                actions={
                    <Button
                        size="l"
                        color="primary"
                        onClick={(ev) =>
                            emulateLinkClick(
                                {
                                    href: setupRoute.render({}),
                                    navigate,
                                },
                                ev,
                            )
                        }
                    >
                        Create your company
                    </Button>
                }
            >
                Welcome to the Expansion{usernameText()}! The first step to conquering the vast expanses of the galaxy
                is to setup your enterprise – so its logo can be met in every city on every world. The rest will follow!
            </InfoDisplay>
        </TouchModal>
    );
};
