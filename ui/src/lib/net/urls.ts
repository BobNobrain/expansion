export function getResourceFullPathname(path: string): string {
    const pathname = window.location.pathname.replace(/\/+$/, '') + path;
    return pathname;
}
