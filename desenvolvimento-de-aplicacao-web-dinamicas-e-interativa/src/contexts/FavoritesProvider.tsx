import { useCallback, useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { FavoritesContext, type FavoritesContextValue } from './FavoritesContext';
import { FAVORITES_KEY, readFavorites, saveFavorites } from '../services/favoritesStorage';

export function FavoritesProvider({ children }: { children?: ReactNode }): ReactElement {
    const [ids, setIds] = useState<number[]>(readFavorites);
    const [warning, setWarning] = useState<string | null>(null);

    useEffect((): void => {
        setWarning(saveFavorites(ids) ? null : 'O navegador não permitiu salvar os favoritos. Eles duram apenas nesta aba.');
    }, [ids]);

    useEffect((): (() => void) => {
        const onStorage = (event: StorageEvent): void => {
            if (event.key === FAVORITES_KEY || event.key === null) { setIds(readFavorites()); }
        };
        window.addEventListener('storage', onStorage);
        return (): void => { window.removeEventListener('storage', onStorage); };
    }, []);

    const toggle = useCallback((id: number): void => {
        if (!Number.isSafeInteger(id) || id <= 0) { return; }
        setIds((current: number[]): number[] => current.includes(id)
            ? current.filter((item: number): boolean => item !== id) : [...current, id]);
    }, []);
    const isFavorite = (id: number): boolean => ids.includes(id);
    const value: FavoritesContextValue = { ids, warning, toggle, isFavorite };
    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
