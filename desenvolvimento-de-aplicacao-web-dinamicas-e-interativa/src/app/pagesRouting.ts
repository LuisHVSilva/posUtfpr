const ROUTE_PARAMETER: string = '__folio_route';

export function fallbackUrl(href: string, base: string): string | null {
    const source: URL = new URL(href);
    const prefix: string = base === '/' ? '' : base.slice(0, -1);
    if (!source.pathname.startsWith(base) && source.pathname !== prefix) { return null; }
    if (source.pathname === base && source.searchParams.has(ROUTE_PARAMETER)) { return null; }
    const route: string = (source.pathname.slice(prefix.length) || '/') + source.search + source.hash;
    const target: URL = new URL(base, source.origin);
    target.searchParams.set(ROUTE_PARAMETER, route);
    return target.href;
}

export function restoredUrl(href: string, base: string): string | null {
    const source: URL = new URL(href);
    const prefix: string = base === '/' ? '' : base.slice(0, -1);
    if (source.pathname !== base && source.pathname !== prefix) { return null; }
    const route: string | null = source.searchParams.get(ROUTE_PARAMETER);
    if (route === null || !route.startsWith('/') || route.startsWith('//') || route.includes('\\')) { return null; }
    const target: URL = new URL(prefix + route, source.origin);
    if (target.origin !== source.origin || (!target.pathname.startsWith(base) && target.pathname !== prefix)) {
        return null;
    }
    return target.pathname + target.search + target.hash;
}

export function restorePagesRoute(): void {
    const route: string | null = restoredUrl(window.location.href, import.meta.env.BASE_URL);
    if (route !== null) { window.history.replaceState(window.history.state, '', route); }
}
