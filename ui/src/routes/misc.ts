import { createRouteTemplate, stringParam } from './utils';

const USER_ROUTE_BASE = '/users';
export const userRoute = createRouteTemplate(`${USER_ROUTE_BASE}/:uid`, {
    uid: stringParam,
});

const COMPANY_ROUTE_BASE = '/companies';
export const companyRoute = createRouteTemplate(`${COMPANY_ROUTE_BASE}/:cid`, {
    cid: stringParam,
});
