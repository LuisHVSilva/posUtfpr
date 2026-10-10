import { createContext, type Context } from 'react';

export interface FavoritesContextValue {
    ids: number[];
    warning: string | null;
    isFavorite: (id: number) => boolean;
    toggle: (id: number) => void;
}

export const FavoritesContext: Context<FavoritesContextValue | null> = createContext<FavoritesContextValue | null>(null);
