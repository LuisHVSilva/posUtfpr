import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { pagesBase, pagesFallbackPlugin } from './scripts/pages-build';

const projectRoot: string = fileURLToPath(new URL('.', import.meta.url));
const testSetup: string = fileURLToPath(new URL('./src/test/setup.ts', import.meta.url));
const base: string = pagesBase(process.env.FOLIO_BASE_PATH);

export default defineConfig({
    root: projectRoot,
    base,
    plugins: [react(), pagesFallbackPlugin(projectRoot, base)],
    build: {
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                pagesFallback: fileURLToPath(new URL('./src/app/pagesFallback.ts', import.meta.url)),
            },
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: [testSetup],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/main.tsx', 'src/app/pagesFallback.ts', 'src/test/**', 'src/**/*.test.*'],
            thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 },
        },
    },
});
