import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '@/components/App/App';
import { HomePage } from '@/touch/pages/HomePage/HomePage';
import { NotFoundPage } from '@/touch/pages/NotFoundPage/NotFoundPage';
import { TouchPageWrapper } from '../TouchPage';
import './touch.css';
import { basesRouteDefs, companyRouteDefs, exploreRouteDefs, factoryRouteDefs, userRouteDefs } from '@/routes/all';

export const TouchUI: Component = () => {
    return (
        <App>
            <HashRouter root={TouchPageWrapper}>
                <Route path="/" component={HomePage} />
                {exploreRouteDefs()}
                {basesRouteDefs()}
                {factoryRouteDefs()}

                {userRouteDefs()}
                {companyRouteDefs()}

                <Route path="*" component={NotFoundPage} />
            </HashRouter>
        </App>
    );
};
