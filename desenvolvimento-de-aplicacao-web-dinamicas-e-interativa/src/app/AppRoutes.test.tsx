import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockApi, httpResponse } from '../test/mockApi';
import { testComments, testPost, testPosts } from '../test/postFixtures';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';

function renderRoute(route: string = '/'): void {
    render(
        <AppProviders>
            <MemoryRouter initialEntries={[route]}><AppRoutes /></MemoryRouter>
        </AppProviders>,
    );
}

describe('Casca visual do Folio', (): void => {
    beforeEach((): void => {
        mockApi((config) => httpResponse(config, config.url === '/posts' ? testPosts
            : config.url?.endsWith('/comments') ? testComments : testPost));
    });
    it.each([
        ['/', 'Histórias para explorar'],
        ['/posts/1', 'Uma história para explorar'],
        ['/login', 'Entre no Folio'],
        ['/cadastro', 'Cadastro demonstrativo'],
        ['/admin', 'Entre no Folio'],
        ['/inexistente', '404 — Página não encontrada'],
    ])('renderiza %s com título e landmarks', async (route: string, title: string): Promise<void> => {
        renderRoute(route);
        expect(await screen.findByRole('heading', { level: 1, name: title })).toBeVisible();
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('navega entre início, login e cadastro', async (): Promise<void> => {
        const user = userEvent.setup();
        renderRoute();
        await user.click(screen.getByRole('link', { name: 'Entrar' }));
        expect(screen.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
        await user.click(screen.getByRole('link', { name: 'Criar cadastro demonstrativo' }));
        expect(screen.getByText(/Não cria uma conta válida/)).toBeVisible();
        await user.click(screen.getByRole('link', { name: 'Voltar para entrar' }));
        await user.click(screen.getByRole('link', { name: 'Voltar ao início' }));
        expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page');
    });

    it('permite alternar o tema pelo controle acessível', async (): Promise<void> => {
        const user = userEvent.setup();
        renderRoute();
        await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }));
        expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
        await user.click(screen.getByRole('button', { name: 'Ativar tema claro' }));
        expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light');
    });
});
