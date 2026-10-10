import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

export function pagesFallbackPlugin(root: string, base: string): Plugin {
    let fallbackFile: string | null = null;
    return {
        name: 'folio-pages-fallback',
        apply: 'build',
        generateBundle(_options, bundle): void {
            for (const output of Object.values(bundle)) {
                if (output.type === 'chunk' && output.name === 'pagesFallback') {
                    fallbackFile = output.fileName;
                }
            }
        },
        async closeBundle(): Promise<void> {
            if (fallbackFile === null) { throw new Error('O entrypoint do fallback não foi gerado.'); }
            const template: string = await readFile(resolve(root, 'public/404.html'), 'utf8');
            const html: string = template.replaceAll('__FOLIO_FALLBACK_SCRIPT__', base + fallbackFile)
                .replaceAll('__FOLIO_BASE__', base);
            await writeFile(resolve(root, 'dist/404.html'), html);
            await writeFile(resolve(root, 'dist/.nojekyll'), '');
        },
    };
}

export function pagesBase(value: string | undefined): string {
    const base: string = value ?? '/';
    if (!/^\/(?:[a-zA-Z0-9_-][a-zA-Z0-9._-]*\/)*$/.test(base)) {
        throw new Error('FOLIO_BASE_PATH deve ser / ou um caminho absoluto com barra final, como /posUtfpr/.');
    }
    return base;
}
