import { expect, test, type Page } from '@playwright/test';
import { examplePost, interceptPosts } from './post-fixtures';

async function expectNoOverflow(page: Page): Promise<void> {
    expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

for (const width of [320, 1280]) {
    test(`busca → artigo/comentários → voltar e paginação em ${width}px`, async ({ page }): Promise<void> => {
        await interceptPosts(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');
        await expect(page.getByRole('heading', { name: examplePost.title })).toHaveCount(1);
        await page.getByRole('button', { name: '2', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'História 7', exact: true })).toBeVisible();
        await page.getByLabel('Buscar publicações').fill('explorar');
        await page.getByRole('button', { name: 'Buscar', exact: true }).click();
        await expect(page).toHaveURL('/?q=explorar');
        await page.getByRole('link', { name: `Ler publicação: ${examplePost.title}` }).click();
        await expect(page.getByRole('heading', { level: 1, name: examplePost.title })).toBeVisible();
        await expect(page.getByText(examplePost.body)).toBeVisible();
        await expect(page.getByText('Uma boa leitura.')).toBeVisible();
        await expectNoOverflow(page);
        await page.getByRole('button', { name: 'Voltar', exact: true }).click();
        await expect(page).toHaveURL('/?q=explorar');
        await expect(page.getByLabel('Buscar publicações')).toHaveValue('explorar');
        await expectNoOverflow(page);
    });

    test(`CRUD demonstrativo e reload sem falsa persistência em ${width}px`, async ({ page }): Promise<void> => {
        await interceptPosts(page);
        await page.route('https://dummyjson.com/auth/me', async (route): Promise<void> => {
            await route.fulfill({ json: {
                id: 1, username: 'emilys', firstName: 'Emily', lastName: 'Johnson', email: 'emily@example.com',
            } });
        });
        await page.addInitScript((): void => {
            localStorage.setItem('folio.session', JSON.stringify({ accessToken: 'e2e-access', refreshToken: 'e2e-refresh' }));
        });
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/admin');
        await expect(page.getByRole('button', { name: `Editar: ${examplePost.title}` })).toBeVisible();
        await expectNoOverflow(page);
        await page.getByRole('button', { name: 'Nova publicação', exact: true }).click();
        await page.getByLabel(/^Título/).fill('Nova história demonstrativa');
        await page.getByLabel(/^Conteúdo/).fill('Um conteúdo demonstrativo suficientemente longo.');
        await page.getByLabel('Tags', { exact: true }).fill('nova, teste');
        await expectNoOverflow(page);
        await page.getByRole('button', { name: 'Salvar publicação' }).click();
        await expect(page.getByRole('button', { name: 'Editar: Nova história demonstrativa' })).toBeVisible();
        await page.getByRole('button', { name: `Editar: ${examplePost.title}` }).click();
        await page.getByLabel(/^Título/).fill('Publicação da API editada');
        await page.getByRole('button', { name: 'Salvar publicação' }).click();
        await expect(page.getByRole('button', { name: 'Editar: Publicação da API editada' })).toBeVisible();
        await page.getByRole('button', { name: 'Excluir: Publicação da API editada' }).click();
        await page.getByRole('button', { name: 'Cancelar' }).click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await page.getByRole('button', { name: 'Editar: Publicação da API editada' }).click();
        await page.getByRole('button', { name: 'Cancelar' }).click();
        await page.getByRole('button', { name: 'Excluir: Publicação da API editada' }).click();
        await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
        await expect(page.getByRole('button', { name: 'Editar: Publicação da API editada' })).toHaveCount(0);
        await page.reload();
        await expect(page.getByRole('button', { name: `Editar: ${examplePost.title}` })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Editar: Nova história demonstrativa' })).toHaveCount(0);
        await expectNoOverflow(page);
    });
}
