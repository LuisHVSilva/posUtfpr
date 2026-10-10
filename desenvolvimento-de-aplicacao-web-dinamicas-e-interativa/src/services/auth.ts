import type { z } from 'zod';
import { api, ApiError } from './api';
import {
    loginResponseSchema, loginSchema, registrationResponseSchema, registerSchema,
    tokensSchema, userSchema, type AuthTokens, type AuthUser, type LoginInput,
    type RegisterInput, type RegistrationResponse,
} from '../schemas/auth';

export interface AuthSession {
    user: AuthUser;
    tokens: AuthTokens;
}

function validated<T>(schema: z.ZodType<T>, value: unknown): T {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
        throw new ApiError('A API retornou dados inválidos. Tente novamente.');
    }
    return parsed.data;
}

async function currentUser(tokens: AuthTokens, signal: AbortSignal): Promise<AuthUser> {
    const response = await api.get<unknown>('/auth/me', {
        signal,
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    return validated(userSchema, response.data);
}

export async function login(values: LoginInput, signal: AbortSignal): Promise<AuthSession> {
    const input: LoginInput = validated(loginSchema, values);
    const response = await api.post<unknown>('/auth/login', { ...input, expiresInMins: 30 }, { signal });
    const data = validated(loginResponseSchema, response.data);
    const tokens: AuthTokens = validated(tokensSchema, data);
    const user: AuthUser = await currentUser(tokens, signal);
    return { user, tokens };
}

export async function renewSession(tokens: AuthTokens, signal: AbortSignal): Promise<AuthSession> {
    const response = await api.post<unknown>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
        expiresInMins: 30,
    }, { signal });
    const renewed: AuthTokens = validated(tokensSchema, response.data);
    const user: AuthUser = await currentUser(renewed, signal);
    return { user, tokens: renewed };
}

export async function restoreSession(tokens: AuthTokens, signal: AbortSignal): Promise<AuthSession> {
    try {
        const user: AuthUser = await currentUser(tokens, signal);
        return { user, tokens };
    } catch (error: unknown) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            return renewSession(tokens, signal);
        }
        throw error;
    }
}

export async function register(values: RegisterInput, signal: AbortSignal): Promise<RegistrationResponse> {
    const input: RegisterInput = validated(registerSchema, values);
    // A confirmação é somente local; a DummyJSON não persiste nem cria credenciais.
    const response = await api.post<unknown>('/users/add', {
        firstName: input.name,
        lastName: '',
        username: input.username,
        email: input.email,
        password: input.password,
    }, { signal });
    return validated(registrationResponseSchema, response.data);
}
