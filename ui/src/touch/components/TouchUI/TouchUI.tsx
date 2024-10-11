import { type Component } from 'solid-js';
import { HashRouter, Route } from '@solidjs/router';
import { App } from '../../../components/App/App';
import { LogInGuard } from '../../../components/LogInGuard';
import { HomePage } from '../../pages/HomePage/HomePage';
import { CartographyPage } from '../../pages/CartographyPage/CartographyPage';
import { NotFoundPage } from '../../pages/NotFoundPage/NotFoundPage';
import { TouchPageWrapper } from '../TouchPage';
import './touch.css';

export const TouchUI: Component = () => {
    return (
        <App>
            <LogInGuard>
                <HashRouter root={TouchPageWrapper}>
                    <Route path="/" component={HomePage} />
                    <Route path="/galaxy/*" component={CartographyPage} />

                    <Route path="*" component={NotFoundPage} />
                </HashRouter>
            </LogInGuard>
        </App>
    );
};
