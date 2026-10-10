import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { mockApi, httpResponse } from '../test/mockApi';
import { testPost, testPosts, testComments } from '../test/postFixtures';
import { FAVORITES_KEY } from '../services/favoritesStorage';

beforeEach((): void => {
    const matchMedia: typeof window.matchMedia = window.matchMedia;
    // JSDOM não mede layout; a animação é verificada pelo hook e pelo Chromium.
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string): MediaQueryList => {
        const media: MediaQueryList = matchMedia(query);
        return query === '(prefers-reduced-motion: reduce)' ? { ...media, matches: true } : media;
    });
});
afterEach((): void => { vi.restoreAllMocks(); });

describe('Favoritos na Home e artigo', (): void => {
    it('alterna com teclado, mantém estado no artigo e remove ao voltar', async (): Promise<void> => {
        mockApi((config) => httpResponse(config, config.url === '/posts' ? testPosts
            : config.url?.endsWith('/comments') ? testComments : testPost));
        render(<AppProviders><MemoryRouter><AppRoutes /></MemoryRouter></AppProviders>);
        const user = userEvent.setup();
        await waitFor((): void => { expect(screen.queryByText('Carregando publicações…')).not.toBeInTheDocument(); });
        const card: HTMLElement = await screen.findByRole('article', { name: testPost.title });
        const favorite: HTMLElement = within(card).getByRole('button', { name: 'Adicionar aos favoritos' });
        favorite.focus();
        expect(favorite).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(await screen.findByRole('button', { name: 'Remover dos favoritos' }))
            .toHaveAttribute('aria-pressed', 'true');
        expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? 'null')).toEqual([1]);
        expect(screen.getAllByRole('heading', { name: 'Favoritos' })).toHaveLength(1);
        await user.click(screen.getByRole('link', { name: `Abrir favorito: ${testPost.title}` }));
        await screen.findByRole('heading', { level: 1, name: testPost.title });
        await user.click(screen.getByRole('button', { name: 'Remover dos favoritos' }));
        expect(screen.getByRole('button', { name: 'Adicionar aos favoritos' })).toHaveAttribute('aria-pressed', 'false');
        await user.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(await screen.findByText('Nenhuma publicação nos favoritos.')).toBeVisible();
        expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? 'null')).toEqual([]);
    });
    it('oferece acesso por ID mesmo quando favorito está fora do resultado atual', async (): Promise<void> => {
        localStorage.setItem(FAVORITES_KEY, '[99]');
        mockApi((config) => httpResponse(config, testPosts));
        render(<AppProviders><MemoryRouter><AppRoutes /></MemoryRouter></AppProviders>);
        expect(screen.getByRole('link', { name: 'Abrir favorito: Publicação #99' })).toHaveAttribute('href', '/posts/99');
    });
});
