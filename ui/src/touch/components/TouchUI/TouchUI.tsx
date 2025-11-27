import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '@/components/App/App';
import { BasesPage } from '@/touch/pages/BasesPage/BasesPage';
import { CartographyPage } from '@/touch/pages/CartographyPage/CartographyPage';
import { CreateFactoryPage } from '@/touch/pages/CreateFactoryPage/CreateFactoryPage';
import { HomePage } from '@/touch/pages/HomePage/HomePage';
import { NotFoundPage } from '@/touch/pages/NotFoundPage/NotFoundPage';
import { TileBasePage } from '@/touch/pages/TileBasePage/TileBasePage';
import { ViewFactoryPage } from '@/touch/pages/ViewFactoryPage/ViewFactoryPage';
import { WorldBasesPage } from '@/touch/pages/WorldBasesPage/WorldBasesPage';
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
                <Route path="/factories/create/:baseId/:tab?" component={CreateFactoryPage} />
                <Route path="/factories/:factoryId" component={ViewFactoryPage} />

                <Route path="*" component={NotFoundPage} />
            </HashRouter>
        </App>
    );
};
