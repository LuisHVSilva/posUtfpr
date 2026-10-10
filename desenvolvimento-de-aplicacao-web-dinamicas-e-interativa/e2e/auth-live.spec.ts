import { expect, test } from '@playwright/test';
import { publicDemoAccount } from './demo-account';

test('DummyJSON real: login, reload, refresh e logout', async ({ page }): Promise<void> => {
    test.skip(process.env.FOLIO_LIVE_API !== '1', 'Execução explícita da API real; fora da suíte determinística.');
    test.setTimeout(60_000);
    await page.goto('/login');
    await page.getByLabel('Nome de usuário').fill(publicDemoAccount.username);
    await page.getByLabel(/^Senha/).fill(publicDemoAccount.password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible({ timeout: 20_000 });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
    // Força a recuperação usando o refresh token real sem expor os tokens em logs.
    await page.evaluate((): void => {
        const raw: string | null = localStorage.getItem('folio.session');
        if (raw === null) {
            throw new Error('Sessão ausente após login real.');
        }
        const value: unknown = JSON.parse(raw);
        if (typeof value !== 'object' || value === null || !('refreshToken' in value)
            || typeof value.refreshToken !== 'string') {
            throw new Error('Contrato da sessão inválido.');
        }
        localStorage.setItem('folio.session', JSON.stringify({
            accessToken: 'invalid-access-token', refreshToken: value.refreshToken,
        }));
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
    expect(await page.evaluate((): string | null => localStorage.getItem('folio.session'))).toBeNull();
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
});
