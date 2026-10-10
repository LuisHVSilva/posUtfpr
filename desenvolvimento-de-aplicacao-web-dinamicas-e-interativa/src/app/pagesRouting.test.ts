import { afterEach, describe, expect, it } from 'vitest';
import { fallbackUrl, restoredUrl, restorePagesRoute } from './pagesRouting';

afterEach((): void => { window.history.replaceState(null, '', '/'); });

describe('Fallback de rotas do Pages', (): void => {
    it.each(['/posts/1?busca=a%2Bb&outro=%26#comentários', '/admin?origem=teste#painel', '/rota-inexistente'])
        ('preserva rota, query e hash %s', (route: string): void => {
            const requested: URL = new URL(`https://example.com/posUtfpr${route}`);
            const redirect: string | null = fallbackUrl(requested.href, '/posUtfpr/');
            if (redirect === null) { throw new Error('Fallback ausente.'); }
            expect(restoredUrl(redirect, '/posUtfpr/')).toBe(requested.pathname + requested.search + requested.hash);
        });
    it('funciona na raiz e não intercepta URLs fora da base', (): void => {
        const redirect: string | null = fallbackUrl('https://example.com/posts/1?q=love#fim', '/');
        if (redirect === null) { throw new Error('Fallback ausente.'); }
        expect(restoredUrl(redirect, '/')).toBe('/posts/1?q=love#fim');
        expect(fallbackUrl('https://example.com/outro/posts/1', '/posUtfpr/')).toBeNull();
        expect(restoredUrl('https://example.com/outro/?__folio_route=%2Fadmin', '/posUtfpr/')).toBeNull();
    });
    it('preserva base sem barra e ignora acesso normal e loop de recuperação', (): void => {
        expect(fallbackUrl('https://example.com/posUtfpr', '/posUtfpr/'))
            .toBe('https://example.com/posUtfpr/?__folio_route=%2F');
        expect(restoredUrl('https://example.com/posUtfpr?__folio_route=%2Fadmin', '/posUtfpr/'))
            .toBe('/posUtfpr/admin');
        expect(restoredUrl('https://example.com/posUtfpr/?q=love', '/posUtfpr/')).toBeNull();
        expect(fallbackUrl('https://example.com/posUtfpr/?__folio_route=%2Fadmin', '/posUtfpr/')).toBeNull();
    });
    it.each(['https://evil.example', '//evil.example', '/../../outro', '/\\evil.example'])
        ('rejeita recuperação inválida %s', (route: string): void => {
            const source: URL = new URL('https://example.com/posUtfpr/');
            source.searchParams.set('__folio_route', route);
            expect(restoredUrl(source.href, '/posUtfpr/')).toBeNull();
        });
    it('restaura history antes do Router sem descartar seu estado', (): void => {
        window.history.replaceState({ from: 'teste' }, '', '/?__folio_route=%2Fposts%2F1%3Fq%3Dlove%23fim');
        restorePagesRoute();
        expect(window.location.pathname + window.location.search + window.location.hash).toBe('/posts/1?q=love#fim');
        expect(window.history.state).toEqual({ from: 'teste' });
        restorePagesRoute();
        expect(window.location.pathname).toBe('/posts/1');
    });
});
