import { act, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { AuthProvider } from '../contexts/AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { SESSION_KEY } from '../services/sessionStorage';
import { testLogin, testRegistration, testTokens, testUser } from '../test/authFixtures';
import { deferred, httpResponse, mockApi } from '../test/mockApi';
import { testPosts } from '../test/postFixtures';

afterEach((): void => { vi.restoreAllMocks(); vi.useRealTimers(); });

function renderRoute(route: string = '/login'): void {
    render(<AppProviders><MemoryRouter initialEntries={[route]}><AppRoutes /></MemoryRouter></AppProviders>);
}

async function fillLogin(): Promise<void> {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome de usuário', { exact: false }), 'emilys');
    await user.type(screen.getByLabelText(/^Senha/), 'test-password');
}

async function fillRegister(): Promise<void> {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^Nome(?:\s*\*)?$/i), testRegistration.name);
    await user.type(screen.getByLabelText(/^Nome de usuário/), testRegistration.username);
    await user.type(screen.getByLabelText(/^E-mail/), testRegistration.email);
    await user.type(screen.getByLabelText(/^Senha/), testRegistration.password);
    await user.type(screen.getByLabelText(/^Confirmar senha/), testRegistration.confirmPassword);
}

describe('Fluxos reais da interface com HTTP determinístico', (): void => {
    it('não envia login com campos vazios e anuncia validação', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}));
        const user = userEvent.setup();
        renderRoute();
        await user.click(screen.getByRole('button', { name: 'Entrar' }));
        expect(await screen.findByText('Informe o nome de usuário.')).toBeVisible();
        expect(screen.getByText('Informe a senha.')).toBeVisible();
        expect(adapter).not.toHaveBeenCalled();
    });

    it('faz login, mostra loading, preserva destino, permite logout e nega novo acesso', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let loginConfig: InternalAxiosRequestConfig | undefined;
        mockApi((config): Promise<AxiosResponse<unknown>> => {
            if (config.url === '/auth/login') {
                loginConfig = config;
                return response.promise;
            }
            return httpResponse(config, testUser);
        });
        const user = userEvent.setup();
        renderRoute('/admin?origem=teste#painel');
        await screen.findByRole('heading', { name: 'Entre no Folio' });
        await fillLogin();
        await user.click(screen.getByRole('button', { name: 'Entrar' }));
        expect(await screen.findByText('Verificando acesso…')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
        if (loginConfig === undefined) {
            throw new Error('O formulário não enviou a solicitação de login.');
        }
        response.resolve(await httpResponse(loginConfig, { ...testUser, ...testTokens }));
        expect(await screen.findByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
        expect(screen.getAllByRole('link', { name: 'Painel' })[0]).toHaveAttribute('href', '/admin');
        expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}')).toEqual(testTokens);
        await user.click(screen.getByRole('button', { name: 'Sair' }));
        expect(await screen.findByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it.each([401, 500])('mostra erro HTTP %s sem salvar sessão', async (status: number): Promise<void> => {
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}, status));
        renderRoute();
        await fillLogin();
        await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
        expect(await screen.findByRole('alert')).toHaveTextContent(/Não foi possível entrar/);
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
    });

    it('mostra falha de rede e permite tentar novamente', async (): Promise<void> => {
        mockApi((): Promise<AxiosResponse<unknown>> => Promise.reject(new AxiosError('Network Error')));
        renderRoute();
        await fillLogin();
        await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
        expect(await screen.findByRole('alert')).toHaveTextContent(/conexão/);
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
    });

    it('espera /auth/me antes de revelar o painel ou redirecionar', async (): Promise<void> => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens));
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        mockApi((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        renderRoute('/admin');
        expect(screen.getByRole('status')).toHaveTextContent('Verificando sua sessão');
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        await waitFor((): void => { expect(config).toBeDefined(); });
        if (config === undefined) {
            throw new Error('A restauração não consultou a API.');
        }
        response.resolve(await httpResponse(config, testUser));
        expect(await screen.findByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
    });

    it('renova sessão expirada antes de abrir o painel e salva os novos tokens', async (): Promise<void> => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens));
        mockApi((config): Promise<AxiosResponse<unknown>> => {
            if (config.url === '/auth/refresh') {
                return httpResponse(config, { accessToken: 'renewed', refreshToken: 'next-refresh' });
            }
            return config.headers.get('Authorization') === 'Bearer renewed'
                ? httpResponse(config, testUser) : httpResponse(config, {}, 401);
        });
        renderRoute('/admin');
        expect(await screen.findByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
        expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}').accessToken).toBe('renewed');
    });

    it('descarta token inválido e informa sessão expirada', async (): Promise<void> => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens));
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}, 401));
        renderRoute('/admin');
        expect(await screen.findByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
        expect(screen.getByRole('alert')).toHaveTextContent(/sessão expirada/);
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Painel de publicações' })).not.toBeInTheDocument();
    });

    it('valida cadastro vazio e confirmação divergente sem enviar dados', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}));
        const user = userEvent.setup();
        renderRoute('/cadastro');
        await user.click(screen.getByRole('button', { name: 'Criar cadastro demonstrativo' }));
        expect(await screen.findByText('Informe um e-mail válido.')).toBeVisible();
        await fillRegister();
        await user.clear(screen.getByLabelText(/^Confirmar senha/));
        await user.type(screen.getByLabelText(/^Confirmar senha/), 'different');
        await user.click(screen.getByRole('button', { name: 'Criar cadastro demonstrativo' }));
        expect(await screen.findByText('As senhas precisam ser iguais.')).toBeVisible();
        expect(adapter).not.toHaveBeenCalled();
    });

    it('envia cadastro demonstrativo, mostra loading e sucesso e limpa senhas', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        mockApi((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        renderRoute('/cadastro');
        await fillRegister();
        await userEvent.click(screen.getByRole('button', { name: 'Criar cadastro demonstrativo' }));
        expect(await screen.findByRole('status')).toHaveTextContent('Enviando cadastro');
        expect(screen.getByRole('button', { name: 'Criar cadastro demonstrativo' })).toBeDisabled();
        if (config === undefined) {
            throw new Error('O cadastro não foi enviado.');
        }
        response.resolve(await httpResponse(config, { id: 209 }));
        expect(await screen.findByText(/Nenhuma conta válida para login foi criada/)).toBeVisible();
        expect(screen.getByLabelText(/^Senha/)).toHaveValue('');
        expect(screen.getByLabelText(/^Confirmar senha/)).toHaveValue('');
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('mostra falha no cadastro sem alegar sucesso', async (): Promise<void> => {
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}, 500));
        renderRoute('/cadastro');
        await fillRegister();
        await userEvent.click(screen.getByRole('button', { name: 'Criar cadastro demonstrativo' }));
        expect(await screen.findByText('Falha no cadastro')).toBeVisible();
        expect(screen.queryByText('Demonstração concluída')).not.toBeInTheDocument();
    });

    it('aborta restauração ao desmontar o provider', async (): Promise<void> => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens));
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        mockApi((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        const result = renderHook(useAuth, { wrapper: AuthProvider });
        await waitFor((): void => { expect(config?.signal?.aborted).toBe(false); });
        result.unmount();
        expect(config?.signal?.aborted).toBe(true);
    });

    it('encerra a sessão nesta aba quando outra aba faz logout', async (): Promise<void> => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens));
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, testUser));
        renderRoute('/admin');
        await screen.findByRole('heading', { name: 'Painel de publicações' });
        act((): void => {
            localStorage.removeItem(SESSION_KEY);
            window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY, newValue: null }));
        });
        expect(await screen.findByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
    });

    it('renova proativamente e limpa o timer na desmontagem', async (): Promise<void> => {
        vi.useFakeTimers();
        const payload: string = btoa(JSON.stringify({ exp: (Date.now() + 61_000) / 1000 }));
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...testTokens, accessToken: `a.${payload}.c` }));
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(
            config, config.url === '/auth/refresh' ? testTokens : testUser,
        ));
        const result = renderHook(useAuth, { wrapper: AuthProvider });
        await act(async (): Promise<void> => { await vi.advanceTimersByTimeAsync(0); });
        expect(result.result.current.status).toBe('authenticated');
        await act(async (): Promise<void> => { await vi.advanceTimersByTimeAsync(1000); });
        expect(adapter.mock.calls.some(([config]): boolean => config.url === '/auth/refresh')).toBe(true);
        expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}')).toEqual(testTokens);
        result.unmount();
        const calls: number = adapter.mock.calls.length;
        await vi.advanceTimersByTimeAsync(1_200_000);
        expect(adapter).toHaveBeenCalledTimes(calls);
    });

    it('useAuth exige seu provider', (): void => {
        expect((): void => { renderHook(useAuth); }).toThrow('useAuth deve ser usado dentro de AuthProvider.');
    });

    it('logout cancela login pendente e impede resposta tardia de reabrir sessão', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        mockApi((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        const result = renderHook(useAuth, { wrapper: AuthProvider });
        let operation: Promise<void> | undefined;
        act((): void => {
            operation = result.result.current.signIn(testLogin, new AbortController().signal);
        });
        await waitFor((): void => { expect(config).toBeDefined(); });
        act((): void => { result.result.current.signOut(); });
        expect(config?.signal?.aborted).toBe(true);
        if (config === undefined || operation === undefined) {
            throw new Error('A solicitação não foi iniciada.');
        }
        const sentConfig: InternalAxiosRequestConfig = config;
        const pendingOperation: Promise<void> = operation;
        await act(async (): Promise<void> => {
            response.resolve(await httpResponse(sentConfig, { ...testUser, ...testTokens }));
            await expect(pendingOperation).rejects.toMatchObject({ code: 'ERR_CANCELED' });
        });
        expect(result.result.current.status).toBe('anonymous');
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('cancela cadastro ao sair da página', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        mockApi((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        renderRoute('/cadastro');
        await fillRegister();
        await userEvent.click(screen.getByRole('button', { name: 'Criar cadastro demonstrativo' }));
        await waitFor((): void => { expect(config).toBeDefined(); });
        await userEvent.click(screen.getByRole('link', { name: 'Voltar para entrar' }));
        expect(config?.signal?.aborted).toBe(true);
        expect(screen.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
    });

    it('controle de senha tem nome e alterna visibilidade com teclado', async (): Promise<void> => {
        renderRoute();
        const user = userEvent.setup();
        const toggle: HTMLElement = screen.getByRole('button', { name: 'Mostrar ou ocultar senha' });
        toggle.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByLabelText(/^Senha/)).toHaveAttribute('type', 'text');
        await user.keyboard('{Enter}');
        expect(screen.getByLabelText(/^Senha/)).toHaveAttribute('type', 'password');
    });

    it('login com sinal já cancelado não envia credenciais ou aceita sessão', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, testUser));
        const hook = renderHook(useAuth, { wrapper: AuthProvider });
        const controller: AbortController = new AbortController();
        controller.abort();
        await act(async (): Promise<void> => {
            await expect(hook.result.current.signIn(testLogin, controller.signal))
                .rejects.toMatchObject({ code: 'ERR_CANCELED' });
        });
        expect(adapter).not.toHaveBeenCalled();
        expect(hook.result.current.status).toBe('anonymous');
    });

    it('cancelamento externo do login impede resposta tardia de autenticar', async (): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        mockApi((request): Promise<AxiosResponse<unknown>> => { config = request; return response.promise; });
        const hook = renderHook(useAuth, { wrapper: AuthProvider });
        const controller: AbortController = new AbortController();
        const operation: Promise<void> = hook.result.current.signIn(testLogin, controller.signal);
        await waitFor((): void => { expect(config).toBeDefined(); });
        controller.abort();
        if (config === undefined) { throw new Error('Login não iniciado.'); }
        response.resolve(await httpResponse(config, { ...testUser, ...testTokens }));
        await act(async (): Promise<void> => { await expect(operation).rejects.toMatchObject({ code: 'ERR_CANCELED' }); });
        expect(hook.result.current.user).toBeNull();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('falha de renovação automática encerra sessão e informa o erro', async (): Promise<void> => {
        vi.useFakeTimers();
        const payload: string = btoa(JSON.stringify({ exp: (Date.now() + 61_000) / 1000 }));
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...testTokens, accessToken: `a.${payload}.c` }));
        mockApi((config): Promise<AxiosResponse<unknown>> => config.url === '/auth/refresh'
            ? httpResponse(config, {}, 401) : httpResponse(config, testUser));
        const hook = renderHook(useAuth, { wrapper: AuthProvider });
        await act(async (): Promise<void> => { await vi.advanceTimersByTimeAsync(0); });
        expect(hook.result.current.status).toBe('authenticated');
        await act(async (): Promise<void> => { await vi.advanceTimersByTimeAsync(1000); });
        expect(hook.result.current.status).toBe('anonymous');
        expect(hook.result.current.sessionError).toMatch(/sessão expirada/);
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it.each(['/login', '/cadastro'])('bloqueia envio duplicado em %s', async (route: string): Promise<void> => {
        const response = deferred<AxiosResponse<unknown>>();
        let config: InternalAxiosRequestConfig | undefined;
        const adapter = mockApi((request): Promise<AxiosResponse<unknown>> => {
            if (request.method === 'post') { config = request; return response.promise; }
            return httpResponse(request, request.url === '/posts' ? testPosts : testUser);
        });
        renderRoute(route);
        if (route === '/login') { await fillLogin(); } else { await fillRegister(); }
        const form: HTMLElement = screen.getByRole('form', { name: route === '/login' ? 'Login' : 'Cadastro demonstrativo' });
        act((): void => { fireEvent.submit(form); fireEvent.submit(form); });
        await waitFor((): void => { expect(adapter).toHaveBeenCalledTimes(1); });
        if (config === undefined) { throw new Error('Formulário não enviado.'); }
        response.resolve(await httpResponse(config, route === '/login' ? { ...testUser, ...testTokens } : { id: 209 }));
        if (route === '/login') {
            expect(await screen.findByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
        } else {
            expect(await screen.findByText(/Nenhuma conta válida para login foi criada/)).toBeVisible();
        }
    }, 10_000);

    it('logout pelo menu móvel fecha menu e nega acesso', async (): Promise<void> => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(testTokens));
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config,
            config.url === '/posts' ? testPosts : testUser));
        renderRoute('/admin');
        await screen.findByRole('heading', { name: 'Painel de publicações' });
        await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
        expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
        const navigation: HTMLElement = await screen.findByRole('navigation', { name: 'Menu móvel' });
        await userEvent.click(within(navigation).getByRole('button', { name: 'Sair' }));
        expect(await screen.findByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
    });
});
