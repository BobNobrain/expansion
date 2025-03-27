const USER_ROUTE_BASE = '/users';
export const USER_ROUTE_DEFINITION = `${USER_ROUTE_BASE}/:uid`;
export type UserRouteParams = { uname?: string };

export type GetUserRouteParams = {
    uname: string;
};

export function getUserRoute({ uname: uname }: GetUserRouteParams): string {
    return [USER_ROUTE_BASE, uname].join('/');
}
