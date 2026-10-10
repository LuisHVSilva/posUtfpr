import { expect, test } from '@playwright/test';
import { deletedPostSchema, postSchema, type PostDraft } from '../src/schemas/posts';

test('DummyJSON real: leitura e contratos do CRUD simulado', async ({ page, request }): Promise<void> => {
    test.skip(process.env.FOLIO_LIVE_API !== '1', 'API real executada separadamente da suíte determinística.');
    test.setTimeout(90_000);
    await page.goto('/');
    await page.getByLabel('Buscar publicações').fill('love');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await page.getByRole('link', { name: /^Ler publicação:/ }).first().click();
    await expect(page).toHaveURL(/\/posts\/\d+$/);
    await expect(page.getByRole('button', { name: 'Adicionar aos favoritos', exact: true }))
        .toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Comentários', exact: true })).toBeVisible();
    await expect(page.getByText('Carregando comentários…')).toHaveCount(0, { timeout: 20_000 });
    await expect(page.getByText('Não foi possível carregar', { exact: true })).toHaveCount(0);

    const originalResponse = await request.get('https://dummyjson.com/posts/1');
    const original = postSchema.safeParse(await originalResponse.json());
    expect(original.success).toBe(true);
    if (!original.success) { throw new Error('Contrato de publicação real inválido.'); }
    const draft: PostDraft = {
        title: 'Demonstração acadêmica Folio', body: 'Conteúdo fictício usado para verificar a API simulada.', tags: ['teste'],
    };
    const createdResponse = await request.post('https://dummyjson.com/posts/add', { data: { ...draft, userId: 1 } });
    expect(createdResponse.ok()).toBe(true);
    expect(postSchema.safeParse(await createdResponse.json()).success).toBe(true);
    const updatedResponse = await request.put('https://dummyjson.com/posts/1', { data: draft });
    expect(updatedResponse.ok()).toBe(true);
    expect(postSchema.safeParse(await updatedResponse.json()).success).toBe(true);
    const deletedResponse = await request.delete('https://dummyjson.com/posts/1');
    expect(deletedResponse.ok()).toBe(true);
    expect(deletedPostSchema.safeParse(await deletedResponse.json()).success).toBe(true);
    const restoredResponse = await request.get('https://dummyjson.com/posts/1');
    const restored = postSchema.safeParse(await restoredResponse.json());
    expect(restored.success).toBe(true);
    if (!restored.success) { throw new Error('Publicação ausente após o CRUD simulado.'); }
    expect(restored.data.title).toBe(original.data.title);
});
