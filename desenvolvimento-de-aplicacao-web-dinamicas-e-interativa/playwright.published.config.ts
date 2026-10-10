import { defineConfig } from '@playwright/test';

const supplied: string | undefined = process.env.FOLIO_PUBLISHED_URL;
if (supplied === undefined) { throw new Error('Informe FOLIO_PUBLISHED_URL para verificar o site publicado.'); }
const site: URL = new URL(supplied);
site.pathname = site.pathname.endsWith('/') ? site.pathname : site.pathname + '/';

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/published.spec.ts',
    timeout: 90_000,
    expect: { timeout: 20_000 },
    workers: 1,
    use: { baseURL: site.href, headless: true, viewport: { width: 1280, height: 900 }, trace: 'off' },
});
