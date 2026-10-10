import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FavoritesProvider } from './FavoritesProvider';
import { useFavorites } from '../hooks/useFavorites';
import { FAVORITES_KEY } from '../services/favoritesStorage';

afterEach((): void => { vi.restoreAllMocks(); });

describe('FavoritesProvider/useFavorites', (): void => {
    it('alterna IDs imutavelmente, persiste e restaura após remontagem', (): void => {
        const hook = renderHook(useFavorites, { wrapper: FavoritesProvider });
        const initial: number[] = hook.result.current.ids;
        act((): void => { hook.result.current.toggle(1); hook.result.current.toggle(2); });
        expect(initial).toEqual([]);
        expect(hook.result.current.isFavorite(1)).toBe(true);
        expect(hook.result.current.ids).toEqual([1, 2]);
        act((): void => { hook.result.current.toggle(1); });
        expect(hook.result.current.ids).toEqual([2]);
        hook.unmount();
        const restored = renderHook(useFavorites, { wrapper: FavoritesProvider });
        expect(restored.result.current.ids).toEqual([2]);
    });
    it('ignora ID inválido e informa falha de persistência mantendo memória', (): void => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => { throw new Error('Blocked'); });
        const hook = renderHook(useFavorites, { wrapper: FavoritesProvider });
        act((): void => { hook.result.current.toggle(0); hook.result.current.toggle(1.5); hook.result.current.toggle(3); });
        expect(hook.result.current.ids).toEqual([3]);
        expect(hook.result.current.warning).toMatch(/não permitiu salvar/);
    });
    it('sincroniza outra aba e remove listener na desmontagem', (): void => {
        const remove = vi.spyOn(window, 'removeEventListener');
        const hook = renderHook(useFavorites, { wrapper: FavoritesProvider });
        act((): void => {
            localStorage.setItem(FAVORITES_KEY, '[7]');
            window.dispatchEvent(new StorageEvent('storage', { key: FAVORITES_KEY }));
        });
        expect(hook.result.current.ids).toEqual([7]);
        act((): void => { window.dispatchEvent(new StorageEvent('storage', { key: 'other' })); });
        expect(hook.result.current.ids).toEqual([7]);
        act((): void => {
            localStorage.clear();
            window.dispatchEvent(new StorageEvent('storage', { key: null }));
        });
        expect(hook.result.current.ids).toEqual([]);
        hook.unmount();
        expect(remove.mock.calls.some(([type]): boolean => type === 'storage')).toBe(true);
    });
    it('exige o provider', (): void => {
        expect((): void => { renderHook(useFavorites); }).toThrow('useFavorites deve ser usado dentro de FavoritesProvider.');
    });
});
