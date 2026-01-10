import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '@/components/App/App';
import {
    basesRouteDefs,
    companyRouteDefs,
    exploreRouteDefs,
    factoryRouteDefs,
    inventoryRouteDefs,
    userRouteDefs,
} from '@/routes/all';
import { HomePage } from '@/touch/pages/HomePage/HomePage';
import { NotFoundPage } from '@/touch/pages/NotFoundPage/NotFoundPage';
import { TouchPageWrapper } from '../TouchPage';
import './touch.css';

export const TouchUI: Component = () => {
    return (
        <App>
            <HashRouter root={TouchPageWrapper}>
                <Route path="/" component={HomePage} />
                {exploreRouteDefs()}
                {inventoryRouteDefs()}
                {factoryRouteDefs()}
                {basesRouteDefs()}

                {userRouteDefs()}
                {companyRouteDefs()}

                <Route path="*" component={NotFoundPage} />
            </HashRouter>
        </App>
    );
};
