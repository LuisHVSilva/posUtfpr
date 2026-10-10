import { z } from 'zod';

export const FAVORITES_KEY: string = 'folio.favorites';
const idsSchema = z.array(z.number().int().positive().refine(Number.isSafeInteger));

export function readFavorites(): number[] {
    try {
        const raw: string | null = localStorage.getItem(FAVORITES_KEY);
        if (raw === null) { return []; }
        const value: unknown = JSON.parse(raw);
        const parsed = idsSchema.safeParse(value);
        return parsed.success ? Array.from(new Set(parsed.data)) : [];
    } catch {
        return [];
    }
}

export function saveFavorites(ids: number[]): boolean {
    const parsed = idsSchema.safeParse(ids);
    if (!parsed.success) { return false; }
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(parsed.data))));
        return true;
    } catch {
        return false;
    }
}
