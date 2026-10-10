import { describe, expect, it, vi } from 'vitest';
import { loginSchema, refreshDelay, registerSchema } from './auth';
import { testRegistration } from '../test/authFixtures';

describe('Schemas e expiração', (): void => {
    it('valida login sem remover espaços da senha', (): void => {
        expect(loginSchema.safeParse({ username: '  emilys ', password: ' pass ' }).data)
            .toEqual({ username: 'emilys', password: ' pass ' });
        expect(loginSchema.safeParse({ username: '', password: '' }).success).toBe(false);
    });
    it('valida nome, usuário, e-mail, senha e confirmação', (): void => {
        expect(registerSchema.safeParse(testRegistration).success).toBe(true);
        expect(registerSchema.safeParse({
            name: 'x', username: 'x', email: 'invalid', password: 'short', confirmPassword: '',
        }).success).toBe(false);
        expect(registerSchema.safeParse({ ...testRegistration, confirmPassword: 'different' }).success).toBe(false);
    });
    it('agenda renovação antes da expiração com limites seguros', (): void => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        const token = (exp: number): string => `header.${btoa(JSON.stringify({ exp }))}.signature`;
        expect(refreshDelay(token(1120))).toBe(60_000);
        expect(refreshDelay(token(1000))).toBe(1000);
        expect(refreshDelay(token(10_000))).toBe(1_200_000);
        vi.restoreAllMocks();
    });
    it.each(['opaque', 'a.invalid.c', `a.${btoa('{}')}.c`])(
        'usa intervalo conservador com payload desconhecido', (token: string): void => {
            expect(refreshDelay(token)).toBe(1_200_000);
        },
    );
});
