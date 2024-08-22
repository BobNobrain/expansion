import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '../../../components/App/App';
import { LogInGuard } from '../../../components/LogInGuard';

// import { GalaxyMapView } from '../../views/GalaxyMapView/GalaxyMapView';
import { HomePageView } from '../../views/HomePageView/HomePageView';
// import { PlanetView } from '../../views/PlanetView/PlanetView';
// import { SystemMapView } from '../../views/SystemMapView/SystemMapView';

import './touch.css';
import { CartographyView } from '../../views/CartographyView/CartographyView';

export const TouchUI: Component = () => {
    return (
        <App>
            <LogInGuard>
                <HashRouter>
                    <Route path="/" component={HomePageView} />
                    <Route path="/galaxy/*" component={CartographyView} />
                    {/* <Route path="/planets/:planeetId/:tileId?" component={PlanetView} /> */}
                </HashRouter>
            </LogInGuard>
        </App>
    );
};
