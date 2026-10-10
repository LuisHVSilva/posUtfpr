import { createContext, type Context } from 'react';
import type { AuthUser, LoginInput } from '../schemas/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    status: 'restoring' | 'anonymous' | 'authenticated';
    sessionError: string | null;
    signIn: (values: LoginInput, signal: AbortSignal) => Promise<void>;
    signOut: () => void;
}

export const AuthContext: Context<AuthContextValue | null> = createContext<AuthContextValue | null>(null);
