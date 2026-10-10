import { expect, test } from '@playwright/test';
import { postSchema } from '../src/schemas/posts';
import { publicDemoAccount } from './demo-account';

test('URL publicada: artigo direto e reload preservam query/hash com API real', async ({ page, request, baseURL }): Promise<void> => {
    if (baseURL === undefined) { throw new Error('URL publicada ausente.'); }
    const response = await request.get('https://dummyjson.com/posts/1');
    const parsed = postSchema.safeParse(await response.json());
    if (!parsed.success) { throw new Error('Contrato da publicação real inválido.'); }
    const target: string = new URL('posts/1?ref=a%2Bb&encoded=%2526#comentarios', baseURL).href;
    const direct = await request.get(target);
    expect(direct.status()).toBe(404);
    await page.goto(target);
    await expect(page.getByRole('heading', { level: 1, name: parsed.data.title })).toBeVisible();
    await expect(page).toHaveURL(target);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: parsed.data.title })).toBeVisible();
    await expect(page).toHaveURL(target);
});

test('URL publicada: admin direto → login real → reload → logout → proteção', async ({ page, baseURL }): Promise<void> => {
    if (baseURL === undefined) { throw new Error('URL publicada ausente.'); }
    const target: string = new URL('admin?origem=publicacao#painel', baseURL).href;
    await page.goto(target);
    await expect(page.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
    await page.getByLabel('Nome de usuário').fill(publicDemoAccount.username);
    await page.getByLabel(/^Senha/).fill(publicDemoAccount.password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
    await expect(page).toHaveURL(target);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Painel de publicações' })).toBeVisible();
    await expect(page).toHaveURL(target);
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Entre no Folio' })).toBeVisible();
    expect(await page.evaluate((): boolean => localStorage.getItem('folio.session') === null)).toBe(true);
    await page.goto(new URL('admin', baseURL).href);
    await expect(page).toHaveURL(new URL('login', baseURL).href);
});
