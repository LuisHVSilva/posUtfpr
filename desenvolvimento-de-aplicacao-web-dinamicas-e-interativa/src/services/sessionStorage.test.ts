import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearStoredSession, readStoredSession, saveStoredSession, SESSION_KEY } from './sessionStorage';
import { testTokens } from '../test/authFixtures';

afterEach((): void => { vi.restoreAllMocks(); });

describe('Storage da sessão', (): void => {
    it('salva somente tokens e remove a sessão', (): void => {
        saveStoredSession({ ...testTokens });
        expect(readStoredSession()).toEqual(testTokens);
        expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}')).toEqual(testTokens);
        clearStoredSession();
        expect(readStoredSession()).toBeNull();
    });
    it.each(['broken json', '{}', '{"accessToken":1,"refreshToken":"x"}'])(
        'descarta storage corrompido %s', (value: string): void => {
            localStorage.setItem(SESSION_KEY, value);
            expect(readStoredSession()).toBeNull();
            expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        },
    );
    it('trata storage bloqueado sem autenticar ou quebrar logout', (): void => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => { throw new Error('Blocked'); });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((): never => { throw new Error('Blocked'); });
        expect(readStoredSession()).toBeNull();
        expect((): void => clearStoredSession()).not.toThrow();
    });
    it('reporta falha ao salvar', (): void => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => { throw new Error('Blocked'); });
        expect((): void => saveStoredSession(testTokens)).toThrow(/armazenamento/);
    });
});
