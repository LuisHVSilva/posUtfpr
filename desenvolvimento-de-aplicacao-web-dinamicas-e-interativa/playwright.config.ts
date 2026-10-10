import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testIgnore: ['**/pages.spec.ts', '**/published.spec.ts'],
    use: { baseURL: 'http://127.0.0.1:4173', headless: true },
    webServer: {
        command: 'yarn dev --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: false,
    },
});
