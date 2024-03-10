import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '../../../components/App/App';
import { LogInGuard } from '../../../components/LogInGuard';

import { HomePageView } from '../../views/HomePageView/HomePageView';
import { GalaxyMapView } from '../../views/GalaxyMapView/GalaxyMapView';
import { PlanetView } from '../../views/PlanetView/PlanetView';

import './touch.css';

export const TouchUI: Component = () => {
    return (
        <App>
            <LogInGuard>
                <HashRouter>
                    <Route path="/" component={HomePageView} />
                    <Route path="/map/:sectorId?" component={GalaxyMapView} />
                    <Route path="/planets/:planeetId/:tileId?" component={PlanetView} />
                </HashRouter>
            </LogInGuard>
        </App>
    );
};
