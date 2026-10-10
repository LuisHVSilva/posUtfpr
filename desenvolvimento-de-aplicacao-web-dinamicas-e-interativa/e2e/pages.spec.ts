import { expect, test } from '@playwright/test';
import { examplePost, interceptPosts } from './post-fixtures';

const base: string = process.env.FOLIO_BASE_PATH ?? '/posUtfpr/';

test('build de Pages usa assets sob a base e 404 real com restauração de query/hash', async ({ page, request }): Promise<void> => {
    await interceptPosts(page);
    const direct: string = `${base}posts/1?ref=a%2Bb&encoded=%2526#comentarios`;
    const missing = await request.get(direct);
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain('Recuperando o endereço');
    await page.goto(direct);
    await expect(page.getByRole('heading', { level: 1, name: examplePost.title })).toBeVisible();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${direct}`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: examplePost.title })).toBeVisible();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${direct}`);
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${base}`);
    const assetUrls: string[] = await page.locator('script[src]').evaluateAll((scripts): string[] =>
        scripts.map((script: Element): string => script.getAttribute('src') ?? ''));
    expect(assetUrls.every((url: string): boolean => url.startsWith(base + 'assets/'))).toBe(true);
});

test('admin direto e reload mantêm sessão e destino sob basename', async ({ page }): Promise<void> => {
    await interceptPosts(page);
    await page.route('https://dummyjson.com/auth/me', async (route): Promise<void> => {
        await route.fulfill({ json: {
            id: 1, username: 'emilys', firstName: 'Emily', lastName: 'Johnson', email: 'emily@example.com',
        } });
    });
    await page.addInitScript((): void => {
        localStorage.setItem('folio.session', JSON.stringify({ accessToken: 'test-access', refreshToken: 'test-refresh' }));
    });
    const direct: string = `${base}admin?origem=pages#painel`;
    await page.goto(direct);
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${direct}`);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${direct}`);
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${base}login`);
});

test('rota inexistente restaura endereço e apresenta 404 da aplicação', async ({ page }): Promise<void> => {
    await page.goto(`${base}inexistente?teste=1#fim`);
    await expect(page.getByRole('heading', { name: '404 — Página não encontrada' })).toBeVisible();
    await expect(page).toHaveURL(`http://127.0.0.1:4174${base}inexistente?teste=1#fim`);
    await page.getByRole('link', { name: 'Voltar ao início' }).click();
    await expect(page.getByRole('heading', { name: 'Histórias para explorar' })).toBeVisible();
});
