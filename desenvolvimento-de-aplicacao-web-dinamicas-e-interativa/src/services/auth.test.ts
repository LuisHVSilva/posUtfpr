import { AxiosError, CanceledError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { login, register, renewSession, restoreSession } from './auth';
import { api, ApiError, normalizeError, setAccessToken } from './api';
import { httpResponse, mockApi } from '../test/mockApi';
import { testLogin, testRegistration, testTokens, testUser } from '../test/authFixtures';

afterEach((): void => { setAccessToken(null); });

describe('Serviços de autenticação e Axios', (): void => {
    it('valida login e verifica a identidade com Bearer em /auth/me', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(
            config, config.url === '/auth/login' ? { ...testUser, ...testTokens } : testUser,
        ));
        expect(await login(testLogin, new AbortController().signal)).toEqual({ user: testUser, tokens: testTokens });
        expect(adapter.mock.calls[1]?.[0].headers.get('Authorization')).toBe('Bearer test-access');
        const request: unknown = JSON.parse(adapter.mock.calls[0]?.[0].data);
        expect(request).toEqual({ ...testLogin, expiresInMins: 30 });
    });

    it('inclui token no interceptor sem sobrescrever um Bearer explícito', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}));
        setAccessToken('session-token');
        await api.get('/example');
        await api.get('/example', { headers: { Authorization: 'Bearer explicit' } });
        expect(adapter.mock.calls[0]?.[0].headers.get('Authorization')).toBe('Bearer session-token');
        expect(adapter.mock.calls[1]?.[0].headers.get('Authorization')).toBe('Bearer explicit');
        setAccessToken(null);
        await api.get('/example');
        expect(adapter.mock.calls[2]?.[0].headers.has('Authorization')).toBe(false);
    });

    it('restaura sessão com identidade verificada', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, testUser));
        expect(await restoreSession(testTokens, new AbortController().signal)).toEqual({
            user: testUser, tokens: testTokens,
        });
        expect(adapter).toHaveBeenCalledTimes(1);
    });

    it('renova após 401 e verifica o novo token, sem repetir indefinidamente', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => {
            if (config.url === '/auth/refresh') {
                return httpResponse(config, { accessToken: 'renewed', refreshToken: 'renewed-refresh' });
            }
            return config.headers.get('Authorization') === 'Bearer renewed'
                ? httpResponse(config, testUser) : httpResponse(config, {}, 401);
        });
        const session = await restoreSession(testTokens, new AbortController().signal);
        expect(session.tokens.accessToken).toBe('renewed');
        expect(adapter).toHaveBeenCalledTimes(3);
        expect(JSON.parse(adapter.mock.calls[1]?.[0].data)).toEqual({
            refreshToken: testTokens.refreshToken, expiresInMins: 30,
        });
    });

    it('rejeita refresh inválido e não aceita apenas o token local', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}, 401));
        await expect(restoreSession(testTokens, new AbortController().signal)).rejects.toMatchObject({ status: 401 });
        expect(adapter).toHaveBeenCalledTimes(2);
    });

    it('não renova em falha de rede', async (): Promise<void> => {
        const adapter = mockApi((): Promise<AxiosResponse<unknown>> => Promise.reject(new AxiosError('Network Error')));
        await expect(restoreSession(testTokens, new AbortController().signal)).rejects.toThrow(/conexão/);
        expect(adapter).toHaveBeenCalledTimes(1);
    });

    it.each([{}, { ...testUser, accessToken: 7, refreshToken: 'valid' }])(
        'rejeita JSON de login incompatível com o contrato', async (data: unknown): Promise<void> => {
            mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, data));
            await expect(login(testLogin, new AbortController().signal)).rejects.toThrow(/dados inválidos/);
        },
    );

    it('rejeita identidade e refresh com dados inválidos', async (): Promise<void> => {
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}));
        await expect(restoreSession(testTokens, new AbortController().signal)).rejects.toThrow(/dados inválidos/);
        await expect(renewSession(testTokens, new AbortController().signal)).rejects.toThrow(/dados inválidos/);
    });

    it('envia cadastro sem confirmação e retorna somente o ID validado', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {
            id: 209, password: testRegistration.password,
        }));
        expect(await register(testRegistration, new AbortController().signal)).toEqual({ id: 209 });
        const config: InternalAxiosRequestConfig | undefined = adapter.mock.calls[0]?.[0];
        expect(config?.url).toBe('/users/add');
        const input: unknown = JSON.parse(config?.data);
        expect(input).toEqual({
            firstName: testRegistration.name, lastName: '', username: testRegistration.username,
            email: testRegistration.email, password: testRegistration.password,
        });
        expect(localStorage.length).toBe(0);
    });

    it('rejeita cadastro com resposta ou entrada inválida', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, { id: '209' }));
        await expect(register(testRegistration, new AbortController().signal)).rejects.toThrow(/dados inválidos/);
        await expect(register({ ...testRegistration, confirmPassword: 'different' }, new AbortController().signal))
            .rejects.toThrow(/dados inválidos/);
        expect(adapter).toHaveBeenCalledTimes(1);
    });

    it.each([400, 401, 403, 500])('normaliza falha HTTP %s', async (status: number): Promise<void> => {
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, { message: 'internal' }, status));
        await expect(api.get('/failure')).rejects.toMatchObject({ name: 'ApiError', status });
    });

    it('preserva cancelamento e falhas controladas e normaliza erros desconhecidos', (): void => {
        const canceled: CanceledError<unknown> = new CanceledError();
        const controlled: ApiError = new ApiError('Mensagem controlada');
        expect(normalizeError(canceled)).toBe(canceled);
        expect(normalizeError(controlled)).toBe(controlled);
        expect(normalizeError({ secret: 'unused' }).message).toMatch(/inesperado/);
    });
});
