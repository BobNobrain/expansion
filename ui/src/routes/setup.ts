import { createRouteTemplate, enumParam } from './utils';

const ROUTE_BASE = '/setup';

export enum AccountSetupStep {
    Career = 'career',
    Name = 'name',
    Logo = 'logo',
    Location = 'location',
    Confirm = 'confirm',
}

export const setupRoute = createRouteTemplate(`${ROUTE_BASE}/:step?`, {
    step: enumParam(
        [
            AccountSetupStep.Career,
            AccountSetupStep.Name,
            AccountSetupStep.Logo,
            AccountSetupStep.Location,
            AccountSetupStep.Confirm,
        ],
        { alwaysRender: true },
    ),
});

export function isSetupRoute(path: string) {
    return path.startsWith(ROUTE_BASE);
}
