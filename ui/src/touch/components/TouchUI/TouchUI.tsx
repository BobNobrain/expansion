import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '../../../components/App/App';
import { HomePage } from '../../pages/HomePage/HomePage';
import { CartographyPage } from '../../pages/CartographyPage/CartographyPage';
import { NotFoundPage } from '../../pages/NotFoundPage/NotFoundPage';
import { TouchPageWrapper } from '../TouchPage';
import './touch.css';

export const TouchUI: Component = () => {
    return (
        <App>
            <HashRouter root={TouchPageWrapper}>
                <Route path="/" component={HomePage} />
                <Route path="/galaxy/:id?/:tab?" component={CartographyPage} />

                <Route path="*" component={NotFoundPage} />
            </HashRouter>
        </App>
    );
};
