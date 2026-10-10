import { expect, test, type Page, type Route } from '@playwright/test';
import { interceptPosts } from './post-fixtures';

const user: Record<string, string | number> = {
    id: 1, username: 'emilys', firstName: 'Emily', lastName: 'Johnson', email: 'emily@example.com',
};
const tokens: Record<string, string> = { accessToken: 'e2e-access', refreshToken: 'e2e-refresh' };

async function interceptAuth(page: Page, invalid: boolean = false): Promise<void> {
    await page.route('https://dummyjson.com/**', async (route: Route): Promise<void> => {
        const path: string = new URL(route.request().url()).pathname;
        if (path === '/auth/me') {
            const bearer: string | undefined = route.request().headers()['authorization'];
            await route.fulfill({
                status: invalid || bearer !== 'Bearer e2e-access' ? 401 : 200,
                json: invalid ? { message: 'Invalid token' } : user,
            });
        } else if (path === '/auth/refresh') {
            await route.fulfill({ status: invalid ? 401 : 200, json: invalid ? {} : tokens });
        } else if (path === '/auth/login') {
            await route.fulfill({ json: { ...user, ...tokens } });
        } else if (path === '/users/add') {
            await route.fulfill({ status: 201, json: { id: 209 } });
        } else {
            await route.abort();
        }
    });
    await interceptPosts(page);
}

for (const width of [320, 1280]) {
    test(`login → painel → reload → logout → acesso negado em ${width}px`, async ({ page }): Promise<void> => {
        await page.setViewportSize({ width, height: 900 });
        await interceptAuth(page);
        await page.goto('/admin?origem=teste#painel');
        await expect(page.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
        await page.getByLabel('Nome de usuário').fill('emilys');
        await page.getByLabel(/^Senha/).fill('test-password');
        const visibilityToggle = page.getByRole('button', { name: 'Mostrar ou ocultar senha' });
        await visibilityToggle.focus();
        await visibilityToggle.press('Enter');
        await expect(page.getByLabel(/^Senha/)).toHaveAttribute('type', 'text');
        await visibilityToggle.press('Enter');
        await expect(page.getByLabel(/^Senha/)).toHaveAttribute('type', 'password');
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await expect(page).toHaveURL('/admin?origem=teste#painel');
        await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
        expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
        if (width === 320) {
            await page.getByRole('button', { name: 'Abrir menu' }).click();
        }
        await expect(page.getByRole('navigation', { name: width === 320 ? 'Menu móvel' : 'Principal', exact: true })
            .getByRole('link', { name: 'Painel', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Sair', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
        expect(await page.evaluate((): string | null => localStorage.getItem('folio.session'))).toBeNull();
        await page.goto('/admin');
        await expect(page).toHaveURL('/login');
    });
}

test('tokens inválidos não liberam o painel', async ({ page }): Promise<void> => {
    await interceptAuth(page, true);
    await page.addInitScript((): void => {
        localStorage.setItem('folio.session', JSON.stringify({ accessToken: 'invalid', refreshToken: 'invalid' }));
    });
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('alert')).toContainText('sessão expirada');
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toHaveCount(0);
});

test('cadastro simulado confirma demonstração sem autenticar ou salvar senha', async ({ page }): Promise<void> => {
    await interceptAuth(page);
    await page.goto('/cadastro');
    await page.getByLabel(/^Nome(?:\s*\*)?$/).fill('Pessoa Teste');
    await page.getByLabel('Nome de usuário').fill('pessoa');
    await page.getByLabel('E-mail').fill('pessoa@example.com');
    await page.getByLabel(/^Senha/).fill('test-password');
    await page.getByLabel('Confirmar senha').fill('test-password');
    await page.getByRole('button', { name: 'Criar cadastro demonstrativo' }).click();
    await expect(page.getByRole('status')).toContainText('Nenhuma conta válida para login foi criada');
    await expect(page.getByLabel(/^Senha/)).toHaveValue('');
    expect(await page.evaluate((): string | null => localStorage.getItem('folio.session'))).toBeNull();
});
