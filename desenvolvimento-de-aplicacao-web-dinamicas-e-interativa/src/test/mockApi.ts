import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { vi } from 'vitest';
import { api } from '../services/api';

export function httpResponse(
    config: InternalAxiosRequestConfig, data: unknown, status: number = 200,
): Promise<AxiosResponse<unknown>> {
    const response: AxiosResponse<unknown> = { data, status, statusText: '', headers: {}, config };
    return status >= 400
        ? Promise.reject(new AxiosError('Resposta HTTP de teste', undefined, config, undefined, response))
        : Promise.resolve(response);
}

export function mockApi(handler: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse<unknown>>) {
    const adapter = vi.fn(handler);
    api.defaults.adapter = adapter;
    return adapter;
}

export function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
    let resolvePromise: (value: T) => void = (): void => {
        throw new Error('A promessa ainda não foi inicializada.');
    };
    const promise: Promise<T> = new Promise<T>((resolve): void => { resolvePromise = resolve; });
    return { promise, resolve: resolvePromise };
}
