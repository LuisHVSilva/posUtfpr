import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';

export function useAuth(): AuthContextValue {
    const context: AuthContextValue | null = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider.');
    }
    return context;
}
