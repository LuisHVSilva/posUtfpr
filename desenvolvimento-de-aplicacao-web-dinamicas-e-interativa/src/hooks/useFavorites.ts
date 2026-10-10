import { useContext } from 'react';
import { FavoritesContext, type FavoritesContextValue } from '../contexts/FavoritesContext';

export function useFavorites(): FavoritesContextValue {
    const context: FavoritesContextValue | null = useContext(FavoritesContext);
    if (context === null) { throw new Error('useFavorites deve ser usado dentro de FavoritesProvider.'); }
    return context;
}
