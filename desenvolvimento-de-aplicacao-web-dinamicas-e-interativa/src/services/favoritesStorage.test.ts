import { afterEach, describe, expect, it, vi } from 'vitest';
import { FAVORITES_KEY, readFavorites, saveFavorites } from './favoritesStorage';

afterEach((): void => { vi.restoreAllMocks(); });

describe('Storage dos favoritos', (): void => {
    it('salva somente IDs únicos e restaura', (): void => {
        expect(saveFavorites([1, 2, 1])).toBe(true);
        expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? 'null')).toEqual([1, 2]);
        expect(readFavorites()).toEqual([1, 2]);
    });
    it.each(['broken', '{}', '[0]', '[-1]', '["1"]', '[1.2]'])(
        'descarta entrada inválida %s', (raw: string): void => {
            localStorage.setItem(FAVORITES_KEY, raw);
            expect(readFavorites()).toEqual([]);
        },
    );
    it('trata ausência, duplicatas e bloqueio do storage', (): void => {
        expect(readFavorites()).toEqual([]);
        localStorage.setItem(FAVORITES_KEY, '[1,1,2]');
        expect(readFavorites()).toEqual([1, 2]);
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => { throw new Error('Blocked'); });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => { throw new Error('Blocked'); });
        expect(readFavorites()).toEqual([]);
        expect(saveFavorites([1])).toBe(false);
    });
    it('não salva IDs inválidos', (): void => {
        expect(saveFavorites([0])).toBe(false);
        expect(saveFavorites([Number.MAX_SAFE_INTEGER + 1])).toBe(false);
        expect(localStorage.getItem(FAVORITES_KEY)).toBeNull();
    });
});
