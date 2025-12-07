import { type Component } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
import { Button, InfoDisplay } from '@/atoms';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';

export const NotFoundPage: Component = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <InfoDisplay
            title="Not Found"
            actions={
                <Button
                    color="primary"
                    onClick={(ev) => {
                        emulateLinkClick({ navigate, href: '/', replace: true }, ev);
                    }}
                >
                    Take me home
                </Button>
            }
        >
            No page exists at <code>{location.pathname}</code>. Maybe it's time to healthcheck the navigation system.
        </InfoDisplay>
    );
};
