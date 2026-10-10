import { tokensSchema, type AuthTokens } from '../schemas/auth';
import { ApiError } from './api';

export const SESSION_KEY: string = 'folio.session';

export function clearStoredSession(): void {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch {
        // Storage indisponível não deve impedir o encerramento da sessão em memória.
    }
}

export function readStoredSession(): AuthTokens | null {
    try {
        const raw: string | null = localStorage.getItem(SESSION_KEY);
        if (raw === null) {
            return null;
        }
        const value: unknown = JSON.parse(raw);
        const parsed = tokensSchema.safeParse(value);
        if (parsed.success) {
            return parsed.data;
        }
    } catch {
        // JSON corrompido ou storage bloqueado não autenticam o visitante.
    }
    clearStoredSession();
    return null;
}

export function saveStoredSession(tokens: AuthTokens): void {
    try {
        const safeTokens: AuthTokens = tokensSchema.parse(tokens);
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeTokens));
    } catch {
        throw new ApiError('Não foi possível salvar a sessão. Habilite o armazenamento do navegador.');
    }
}
