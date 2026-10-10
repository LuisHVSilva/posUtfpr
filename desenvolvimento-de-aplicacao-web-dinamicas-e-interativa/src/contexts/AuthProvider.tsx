import { useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { login, renewSession, restoreSession, type AuthSession } from '../services/auth';
import { errorMessage, setAccessToken } from '../services/api';
import {
    clearStoredSession, readStoredSession, saveStoredSession, SESSION_KEY,
} from '../services/sessionStorage';
import { refreshDelay, type AuthTokens, type LoginInput } from '../schemas/auth';

export function AuthProvider({ children }: { children?: ReactNode }): ReactElement {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [status, setStatus] = useState<AuthContextValue['status']>('restoring');
    const [sessionError, setSessionError] = useState<string | null>(null);
    const pending = useRef<AbortController | null>(null);
    const revision = useRef<number>(0);

    const signOut = useCallback((): void => {
        revision.current += 1;
        pending.current?.abort();
        setAccessToken(null);
        clearStoredSession();
        setSession(null);
        setStatus('anonymous');
        setSessionError(null);
    }, []);

    const accept = useCallback((next: AuthSession): void => {
        saveStoredSession(next.tokens);
        setAccessToken(next.tokens.accessToken);
        setSession(next);
        setStatus('authenticated');
        setSessionError(null);
    }, []);

    const signIn = useCallback(async (values: LoginInput, signal: AbortSignal): Promise<void> => {
        const attempt: number = ++revision.current;
        pending.current?.abort();
        const controller: AbortController = new AbortController();
        pending.current = controller;
        const abort = (): void => { controller.abort(); };
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) {
            controller.abort();
        }
        try {
            const next: AuthSession = await login(values, controller.signal);
            if (!controller.signal.aborted && attempt === revision.current) {
                accept(next);
            }
        } finally {
            signal.removeEventListener('abort', abort);
        }
    }, [accept]);

    useEffect((): (() => void) => {
        const restore = (): void => {
            const attempt: number = ++revision.current;
            pending.current?.abort();
            const controller: AbortController = new AbortController();
            pending.current = controller;
            const stored: AuthTokens | null = readStoredSession();
            setAccessToken(null);
            setSession(null);
            setStatus('restoring');
            if (stored === null) {
                setStatus('anonymous');
                return;
            }
            void restoreSession(stored, controller.signal).then((next: AuthSession): void => {
                if (!controller.signal.aborted && attempt === revision.current) {
                    accept(next);
                }
            }).catch((error: unknown): void => {
                if (!controller.signal.aborted && attempt === revision.current) {
                    signOut();
                    setSessionError(errorMessage(error));
                }
            });
        };
        const onStorage = (event: StorageEvent): void => {
            if (event.key === SESSION_KEY || event.key === null) {
                restore();
            }
        };
        restore();
        window.addEventListener('storage', onStorage);
        return (): void => {
            revision.current += 1;
            pending.current?.abort();
            setAccessToken(null);
            window.removeEventListener('storage', onStorage);
        };
    }, [accept, signOut]);

    useEffect((): (() => void) | undefined => {
        if (session === null) {
            return undefined;
        }
        const controller: AbortController = new AbortController();
        const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
            const attempt: number = revision.current;
            pending.current = controller;
            void renewSession(session.tokens, controller.signal).then((next: AuthSession): void => {
                if (!controller.signal.aborted && attempt === revision.current) {
                    accept(next);
                }
            }).catch((error: unknown): void => {
                if (!controller.signal.aborted && attempt === revision.current) {
                    signOut();
                    setSessionError(errorMessage(error));
                }
            });
        }, refreshDelay(session.tokens.accessToken));
        return (): void => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [session, accept, signOut]);

    const value: AuthContextValue = {
        user: session?.user ?? null, status, sessionError, signIn, signOut,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
