import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { httpResponse, mockApi, deferred } from '../test/mockApi';
import { testComments, testPost, testPosts } from '../test/postFixtures';
import { testTokens, testUser } from '../test/authFixtures';
import { SESSION_KEY } from '../services/sessionStorage';
import { postDraftSchema, type Post } from '../schemas/posts';

afterEach((): void => { vi.restoreAllMocks(); });

function standardResponse(config: InternalAxiosRequestConfig): Promise<AxiosResponse<unknown>> {
    if (config.url === '/posts' || config.url === '/posts/search') { return httpResponse(config, testPosts); }
    if (config.url?.endsWith('/comments')) { return httpResponse(config, testComments); }
    if (config.method === 'post' || config.method === 'put') {
        const input: unknown = JSON.parse(String(config.data));
        const draft = postDraftSchema.parse(input);
        return httpResponse(config, { ...testPost, ...draft, id: config.method === 'post' ? 252 : 1 });
    }
    if (config.method === 'delete') {
        return httpResponse(config, { id: 1, isDeleted: true, deletedOn: '2026-10-09' });
    }
    return httpResponse(config, testPost);
}

function installMock(handler = standardResponse) {
    return mockApi((config): Promise<AxiosResponse<unknown>> => config.url === '/auth/me'
        ? httpResponse(config, testUser) : handler(config));
}

function renderRoute(route: string = '/'): ReturnType<typeof render> {
    if (route.startsWith('/admin')) { localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens)); }
    return render(<AppProviders><MemoryRouter initialEntries={[route]}><AppRoutes /></MemoryRouter></AppProviders>);
}

async function fillPost(title: string = 'Nova história'): Promise<void> {
    const user = userEvent.setup();
    const dialog: HTMLElement = await screen.findByRole('dialog');
    const titleInput: HTMLElement = within(dialog).getByLabelText(/^Título/);
    const bodyInput: HTMLElement = within(dialog).getByLabelText(/^Conteúdo/);
    await user.click(titleInput);
    await waitFor((): void => { expect(titleInput).toHaveFocus(); });
    await user.clear(titleInput);
    await user.type(titleInput, title);
    await user.clear(bodyInput);
    await user.type(bodyInput, 'Conteúdo válido para a publicação demonstrativa.');
}

describe('Home e artigo com HTTP determinístico', (): void => {
    it('retry do artigo recupera falha de rede sem depender de reload', async (): Promise<void> => {
        let fail: boolean = true;
        const adapter = installMock((config): Promise<AxiosResponse<unknown>> => config.url === '/posts/1' && fail
            ? httpResponse(config, {}, 500) : standardResponse(config));
        renderRoute('/posts/1');
        await screen.findByRole('alert');
        fail = false;
        await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByRole('heading', { level: 1, name: testPost.title })).toBeVisible();
        expect(adapter.mock.calls.filter(([config]): boolean => config.url === '/posts/1')).toHaveLength(2);
    });

    it('resumo longo e metadados opcionais não impedem leitura', async (): Promise<void> => {
        const post: Post = { id: 1, userId: 1, title: 'Texto longo', body: 'Um trecho de leitura. '.repeat(25), tags: [] };
        installMock((config): Promise<AxiosResponse<unknown>> => config.url === '/posts'
            ? httpResponse(config, { ...testPosts, posts: [post] })
            : config.url?.endsWith('/comments') ? httpResponse(config, {
                ...testComments, comments: [{ id: 1, postId: 1, body: 'Comentário', user: { id: 2, username: 'leitora' } }],
            }) : httpResponse(config, post));
        renderRoute();
        await screen.findByRole('heading', { name: post.title });
        expect(screen.getByText(`${post.body.slice(0, 190)}…`)).toBeVisible();
        expect(screen.queryByText(/curtidas/)).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('link', { name: `Ler publicação: ${post.title}` }));
        expect(await screen.findByText('leitora')).toBeVisible();
        expect(screen.getByText(post.body.trim())).toBeVisible();
    });

    it('busca limpa volta à listagem e informa storage indisponível para favoritos', async (): Promise<void> => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => { throw new Error('Blocked'); });
        const adapter = installMock();
        renderRoute('/?q=história&page=2');
        await screen.findByRole('heading', { name: testPost.title });
        await userEvent.clear(screen.getByLabelText('Buscar publicações'));
        await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
        await waitFor((): void => {
            expect(adapter.mock.calls.some(([config]): boolean => config.url === '/posts' && config.params.skip === 0)).toBe(true);
        });
        expect(screen.getByRole('alert')).toHaveTextContent('não permitiu salvar os favoritos');
    });
    it('mostra loading, recebe conteúdo e destaca sem duplicar', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        installMock((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        renderRoute();
        expect(screen.getByRole('status')).toHaveTextContent('Carregando publicações');
        await waitFor((): void => { expect(config).toBeDefined(); });
        if (config === undefined) { throw new Error('Listagem não iniciada.'); }
        const second: Post = { ...testPost, id: 2, title: 'Outra história' };
        response.resolve(await httpResponse(config, { ...testPosts, posts: [testPost, second], total: 2 }));
        expect(await screen.findByRole('heading', { name: testPost.title })).toBeVisible();
        expect(screen.getAllByRole('heading', { name: testPost.title })).toHaveLength(1);
        expect(screen.getByRole('heading', { name: second.title })).toBeVisible();
        expect(screen.getByText('DESTAQUE EDITORIAL')).toBeVisible();
    });

    it('trata erro e permite tentar novamente; apresenta vazio sem destaque fictício', async (): Promise<void> => {
        let fail: boolean = true;
        installMock((config): Promise<AxiosResponse<unknown>> => fail ? httpResponse(config, {}, 500)
            : httpResponse(config, { ...testPosts, posts: [], total: 0 }));
        renderRoute();
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
        fail = false;
        await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Nenhuma publicação encontrada.')).toBeVisible();
        expect(screen.queryByText('DESTAQUE EDITORIAL')).not.toBeInTheDocument();
    });

    it('busca explícita reinicia paginação e conserva busca ao abrir artigo e voltar', async (): Promise<void> => {
        const adapter = installMock((config): Promise<AxiosResponse<unknown>> => {
            if (config.url === '/posts' || config.url === '/posts/search') {
                return httpResponse(config, { ...testPosts, total: 12, skip: config.params.skip });
            }
            return standardResponse(config);
        });
        const user = userEvent.setup();
        renderRoute('/?page=2');
        await screen.findByRole('heading', { name: testPost.title });
        await user.type(screen.getByLabelText('Buscar publicações'), 'história');
        expect(adapter.mock.calls.filter(([config]): boolean => config.url === '/posts/search')).toHaveLength(0);
        await user.click(screen.getByRole('button', { name: 'Buscar' }));
        await waitFor((): void => {
            expect(adapter.mock.calls.some(([config]): boolean => config.url === '/posts/search'
                && config.params.skip === 0 && config.params.q === 'história')).toBe(true);
        });
        await user.click(await screen.findByRole('link', { name: `Ler publicação: ${testPost.title}` }));
        expect(await screen.findByRole('heading', { level: 1, name: testPost.title })).toBeVisible();
        expect(await screen.findByText('Uma boa leitura.')).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(await screen.findByLabelText('Buscar publicações')).toHaveValue('história');
    });

    it('pagina pelo total da API', async (): Promise<void> => {
        const adapter = installMock((config): Promise<AxiosResponse<unknown>> => httpResponse(config,
            { ...testPosts, total: 12, skip: config.params.skip }));
        renderRoute();
        await screen.findByRole('heading', { name: testPost.title });
        await userEvent.click(screen.getByRole('button', { name: '2' }));
        await waitFor((): void => { expect(adapter.mock.calls.some(([config]): boolean => config.params.skip === 6)).toBe(true); });
    });

    it('ID inválido não dispara HTTP e permite voltar à Home', async (): Promise<void> => {
        const adapter = installMock();
        renderRoute('/posts/abc');
        expect(await screen.findByText('O identificador da publicação é inválido.')).toBeVisible();
        expect(adapter).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(await screen.findByRole('heading', { name: 'Histórias para explorar' })).toBeVisible();
    });

    it('trata publicação ausente com retorno utilizável', async (): Promise<void> => {
        installMock((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}, 404));
        renderRoute('/posts/99999');
        expect(await screen.findByText('Publicação não encontrada.')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Voltar' })).toBeEnabled();
    });

    it('falha nos comentários não esconde artigo; retry pode resultar vazio', async (): Promise<void> => {
        let fail: boolean = true;
        installMock((config): Promise<AxiosResponse<unknown>> => config.url?.endsWith('/comments')
            ? fail ? httpResponse(config, {}, 500) : httpResponse(config, { ...testComments, comments: [], total: 0 })
            : httpResponse(config, testPost));
        renderRoute('/posts/1');
        expect(await screen.findByRole('heading', { name: testPost.title })).toBeVisible();
        await screen.findByRole('alert');
        fail = false;
        await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Nenhum comentário nesta publicação.')).toBeVisible();
        expect(screen.getByText(testPost.body)).toBeVisible();
    });

    it('renderiza corpo como texto e cancela listagem na desmontagem', async (): Promise<void> => {
        installMock((config): Promise<AxiosResponse<unknown>> => config.url?.endsWith('/comments')
            ? httpResponse(config, testComments) : httpResponse(config, { ...testPost, body: '<script>alert(1)</script>' }));
        const mounted = renderRoute('/posts/1');
        expect(await screen.findByText('<script>alert(1)</script>')).toBeVisible();
        expect(document.querySelector('script')).toBeNull();
        mounted.unmount();
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        installMock((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        const pending = renderRoute();
        await waitFor((): void => { expect(config).toBeDefined(); });
        pending.unmount();
        expect(config?.signal?.aborted).toBe(true);
    });
});

describe('Painel e CRUD demonstrativo', (): void => {
    it('publicação sem tags tem estado explícito na tabela', async (): Promise<void> => {
        installMock((config): Promise<AxiosResponse<unknown>> => httpResponse(config,
            { ...testPosts, posts: [{ ...testPost, tags: [] }] }));
        renderRoute('/admin');
        expect(await screen.findByText('Sem tags')).toBeVisible();
    });
    it('valida formulário, cria e permite editar/excluir item local sem HTTP fictício', async (): Promise<void> => {
        const adapter = installMock();
        const user = userEvent.setup();
        renderRoute('/admin');
        await screen.findByText(testPost.title);
        await user.click(await screen.findByRole('button', { name: 'Nova publicação' }));
        await user.click(screen.getByRole('button', { name: 'Salvar publicação' }));
        expect(await screen.findByText('Use um título com pelo menos 3 caracteres.')).toBeVisible();
        await fillPost();
        await user.type(screen.getByLabelText('Tags'), 'vida, , leitura, vida');
        await user.click(screen.getByRole('button', { name: 'Salvar publicação' }));
        expect(await screen.findByText('Publicação criada nesta demonstração.')).toBeVisible();
        expect(screen.getByText('Nova história')).toBeVisible();
        const createdRequest = adapter.mock.calls.find(([config]): boolean => config.url === '/posts/add');
        expect(JSON.parse(String(createdRequest?.[0].data))).toMatchObject({ tags: ['vida', 'leitura'], userId: 1 });
        const count: number = adapter.mock.calls.length;
        await user.click(screen.getByRole('button', { name: 'Editar: Nova história' }));
        await fillPost('História local editada');
        await user.click(screen.getByRole('button', { name: 'Salvar publicação' }));
        expect(await screen.findByText('História local editada')).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Excluir: História local editada' }));
        await user.click(await screen.findByRole('button', { name: 'Confirmar exclusão' }));
        await waitFor((): void => { expect(screen.queryByText('História local editada')).not.toBeInTheDocument(); });
        expect(adapter).toHaveBeenCalledTimes(count);
        expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}')).toEqual(testTokens);
    }, 15_000);

    it('edita via PUT, conserva alteração ao paginar e não modifica fixture original', async (): Promise<void> => {
        const originalTitle: string = testPost.title;
        const adapter = installMock((config): Promise<AxiosResponse<unknown>> => config.url === '/posts'
            ? httpResponse(config, { ...testPosts, total: 12, skip: config.params.skip }) : standardResponse(config));
        const user = userEvent.setup();
        renderRoute('/admin');
        await screen.findByText(testPost.title);
        await user.click(await screen.findByRole('button', { name: `Editar: ${testPost.title}` }));
        expect(screen.getByLabelText(/^Título/)).toHaveValue(testPost.title);
        await fillPost('História editada');
        await user.click(screen.getByRole('button', { name: 'Salvar publicação' }));
        expect(await screen.findByText('História editada')).toBeVisible();
        expect(adapter.mock.calls.some(([config]): boolean => config.method === 'put' && config.url === '/posts/1')).toBe(true);
        await user.click(screen.getByRole('button', { name: '2' }));
        await screen.findByText('12 publicações na API.');
        await waitFor((): void => { expect(screen.getByRole('button', { name: '1' })).toBeEnabled(); });
        await user.click(screen.getByRole('button', { name: '1' }));
        expect(await screen.findByText('História editada')).toBeVisible();
        expect(testPost.title).toBe(originalTitle);
    });

    it('exclusão exige confirmação, permite cancelar e atualiza lista somente após sucesso', async (): Promise<void> => {
        const adapter = installMock();
        const user = userEvent.setup();
        renderRoute('/admin');
        await screen.findByText(testPost.title);
        await user.click(await screen.findByRole('button', { name: `Excluir: ${testPost.title}` }));
        await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
        await waitFor((): void => { expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); });
        expect(adapter.mock.calls.some(([config]): boolean => config.method === 'delete')).toBe(false);
        await user.click(screen.getByRole('button', { name: `Excluir: ${testPost.title}` }));
        await user.click(await screen.findByRole('button', { name: 'Confirmar exclusão' }));
        expect(await screen.findByText('Publicação excluída nesta demonstração.')).toBeVisible();
        expect(screen.queryByRole('button', { name: `Editar: ${testPost.title}` })).not.toBeInTheDocument();
        expect(screen.getByText('Nenhuma publicação nesta página da demonstração.')).toBeVisible();
    });

    it.each(['post', 'put', 'delete'])('falha de %s mostra erro e mantém lista/formulário', async (method: string): Promise<void> => {
        installMock((config): Promise<AxiosResponse<unknown>> => config.method === method
            ? httpResponse(config, {}, 500) : standardResponse(config));
        const user = userEvent.setup();
        renderRoute('/admin');
        await screen.findByText(testPost.title);
        const action: string = method === 'post' ? 'Nova publicação'
            : `${method === 'put' ? 'Editar' : 'Excluir'}: ${testPost.title}`;
        await user.click(await screen.findByRole('button', { name: action }));
        if (method !== 'delete') { await fillPost(); }
        await user.click(await screen.findByRole('button', { name: method === 'delete' ? 'Confirmar exclusão' : 'Salvar publicação' }));
        expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent('Não foi possível concluir');
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(screen.getByRole('button', { name: `Editar: ${testPost.title}` })).toBeVisible();
    });

    it('loading de salvar desabilita ações; desmontagem aborta a mutação', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        installMock((request): Promise<AxiosResponse<unknown>> => {
            if (request.method === 'post') { config = request; return response.promise; }
            return standardResponse(request);
        });
        const user = userEvent.setup();
        const mounted = renderRoute('/admin');
        await screen.findByText(testPost.title);
        await user.click(await screen.findByRole('button', { name: 'Nova publicação' }));
        await fillPost();
        await user.click(screen.getByRole('button', { name: 'Salvar publicação' }));
        expect(await screen.findByText('Salvando publicação…')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Salvar publicação' })).toBeDisabled();
        act((): void => { mounted.unmount(); });
        expect(config?.signal?.aborted).toBe(true);
    });
});
