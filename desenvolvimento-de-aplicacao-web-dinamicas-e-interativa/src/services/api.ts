import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export class ApiError extends Error {
    constructor(message: string, public readonly status: number | null = null) {
        super(message);
        this.name = 'ApiError';
    }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

export function normalizeError(error: unknown): Error {
    if (error instanceof ApiError || axios.isCancel(error)) {
        return error;
    }
    if (axios.isAxiosError<unknown>(error)) {
        const status: number | null = error.response?.status ?? null;
        if (status === 401 || status === 403) {
            return new ApiError('Usuário ou senha inválidos, ou sessão expirada. Entre novamente.', status);
        }
        if (status === null) {
            return new ApiError('Não foi possível conectar. Verifique sua conexão e tente novamente.');
        }
        return new ApiError('Não foi possível concluir a solicitação. Tente novamente.', status);
    }
    return new ApiError('Ocorreu um erro inesperado. Tente novamente.');
}

export function errorMessage(error: unknown): string {
    return normalizeError(error).message;
}

export const api: AxiosInstance = axios.create({
    baseURL: 'https://dummyjson.com',
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (accessToken !== null && !config.headers.has('Authorization')) {
        config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: unknown): Promise<never> => Promise.reject(normalizeError(error)),
);
