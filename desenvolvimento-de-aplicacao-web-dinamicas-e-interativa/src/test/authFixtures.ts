import type { AuthTokens, AuthUser, LoginInput, RegisterInput } from '../schemas/auth';

export const testUser: AuthUser = {
    id: 1, username: 'emilys', firstName: 'Emily', lastName: 'Johnson', email: 'emily@example.com',
};
export const testTokens: AuthTokens = { accessToken: 'test-access', refreshToken: 'test-refresh' };
export const testLogin: LoginInput = { username: 'emilys', password: 'test-password' };
export const testRegistration: RegisterInput = {
    name: 'Pessoa Teste', username: 'pessoa', email: 'pessoa@example.com',
    password: 'test-password', confirmPassword: 'test-password',
};
