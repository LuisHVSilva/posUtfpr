import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().trim().min(1, 'Informe o nome de usuário.'),
    password: z.string().min(1, 'Informe a senha.'),
});

export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Informe um nome com pelo menos 2 caracteres.'),
    username: z.string().trim().min(3, 'Use pelo menos 3 caracteres no nome de usuário.'),
    email: z.email('Informe um e-mail válido.'),
    password: z.string().min(8, 'Use uma senha com pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
}).refine((values): boolean => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas precisam ser iguais.',
});

export const userSchema = z.object({
    id: z.number().int().positive(),
    username: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string(),
    email: z.email(),
});

export const tokensSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
});

export const loginResponseSchema = userSchema.extend(tokensSchema.shape);
export const registrationResponseSchema = z.object({ id: z.number().int().positive() });
const expirySchema = z.object({ exp: z.number().positive() });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthUser = z.infer<typeof userSchema>;
export type AuthTokens = z.infer<typeof tokensSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegistrationResponse = z.infer<typeof registrationResponseSchema>;

export function refreshDelay(accessToken: string): number {
    // A expiração serve só ao timer; a API, nunca o payload local, valida a sessão.
    try {
        const payload: string | undefined = accessToken.split('.')[1];
        if (payload === undefined) {
            return 20 * 60 * 1000;
        }
        const json: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const parsed = expirySchema.safeParse(json);
        return parsed.success
            ? Math.max(1000, Math.min(20 * 60 * 1000, parsed.data.exp * 1000 - Date.now() - 60_000))
            : 20 * 60 * 1000;
    } catch {
        return 20 * 60 * 1000;
    }
}
