import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '../../../components/App/App';
import { BaseProductionGraphPage } from '../../pages/BaseProductionGraphPage/BaseProductionGraphPage';
import { BasesPage } from '../../pages/BasesPage/BasesPage';
import { CartographyPage } from '../../pages/CartographyPage/CartographyPage';
import { HomePage } from '../../pages/HomePage/HomePage';
import { NotFoundPage } from '../../pages/NotFoundPage/NotFoundPage';
import { TileBasePage } from '../../pages/TileBasePage/TileBasePage';
import { WorldBasesPage } from '../../pages/WorldBasesPage/WorldBasesPage';
import { TouchPageWrapper } from '../TouchPage';
import './touch.css';

export const TouchUI: Component = () => {
    return (
        <App>
            <HashRouter root={TouchPageWrapper}>
                <Route path="/" component={HomePage} />
                <Route path="/galaxy/:id?/:tab?" component={CartographyPage} />
                <Route path="/bases" component={BasesPage} />
                <Route path="/bases/:worldId" component={WorldBasesPage} />
                <Route path="/bases/:worldId/:tileId/:tab?" component={TileBasePage} />
                <Route path="/production" component={BaseProductionGraphPage} />

                <Route path="*" component={NotFoundPage} />
            </HashRouter>
        </App>
    );
};
