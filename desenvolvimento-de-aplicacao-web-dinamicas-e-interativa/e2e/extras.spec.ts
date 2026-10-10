import { expect, test, type Page } from '@playwright/test';
import { examplePost, interceptPosts } from './post-fixtures';

async function noOverflow(page: Page): Promise<void> {
    expect(await page.evaluate((): boolean => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('favoritos e tema persistem, incluindo remoção pelo artigo', async ({ page }): Promise<void> => {
    await interceptPosts(page);
    await page.goto('/');
    const card = page.getByRole('article', { name: examplePost.title });
    const addFavorite = card.getByRole('button', { name: 'Adicionar aos favoritos', exact: true });
    await addFavorite.focus();
    await addFavorite.press('Enter');
    await expect(card.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate((): string | null => localStorage.getItem('folio.favorites'))).toBe('[1]');
    await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
    await expect(card.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('link', { name: `Abrir favorito: ${examplePost.title}` }).click();
    await page.getByRole('button', { name: 'Remover dos favoritos', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Adicionar aos favoritos', exact: true }))
        .toHaveAttribute('aria-pressed', 'false');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Adicionar aos favoritos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(page.getByText('Nenhuma publicação nos favoritos.')).toBeVisible();
    await page.getByRole('button', { name: 'Ativar tema claro' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'light');
});

test('redução de movimento deixa destaque sem transformação e permite navegar', async ({ page }): Promise<void> => {
    await interceptPosts(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const card = page.getByRole('article', { name: examplePost.title });
    await expect(card).toBeVisible();
    expect(await card.evaluate((element: HTMLElement): string =>
        element.parentElement === null ? 'missing' : getComputedStyle(element.parentElement).transform)).toBe('none');
    await card.getByRole('link', { name: `Ler publicação: ${examplePost.title}` }).click();
    await expect(page.getByRole('heading', { level: 1, name: examplePost.title })).toBeVisible();
});

for (const width of [320, 375, 768, 1280]) {
    for (const scheme of ['light', 'dark']) {
        test(`telas, foco e contraste em ${width}px / ${scheme}`, async ({ page }): Promise<void> => {
            await interceptPosts(page);
            await page.route('https://dummyjson.com/auth/me', async (route): Promise<void> => {
                await route.fulfill({ json: {
                    id: 1, username: 'emilys', firstName: 'Emily', lastName: 'Johnson', email: 'emily@example.com',
                } });
            });
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto('/');
            if (scheme === 'dark') { await page.getByRole('button', { name: 'Ativar tema escuro' }).click(); }
            for (const route of ['/', '/posts/1', '/login', '/cadastro', '/inexistente']) {
                await page.goto(route);
                await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
                await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', scheme);
                await noOverflow(page);
            }
            await page.goto('/');
            await expect(page.getByRole('article', { name: examplePost.title })).toBeVisible();
            await page.screenshot({ path: `test-results/folio-${width}-${scheme}.png`, fullPage: true });
            const ratios: { body: number; link: number; button: number } = await page.evaluate(() => {
                const luminance = (color: string): number => {
                    const values: number[] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((value: string): number => {
                        const channel: number = Number(value) / 255;
                        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
                    });
                    return (values[0] ?? 0) * 0.2126 + (values[1] ?? 0) * 0.7152 + (values[2] ?? 0) * 0.0722;
                };
                const ratio = (foreground: string, background: string): number => {
                    const a: number = luminance(foreground);
                    const b: number = luminance(background);
                    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
                };
                const body: CSSStyleDeclaration = getComputedStyle(document.body);
                const link: Element | null = document.querySelector('article a');
                const card: Element | null = document.querySelector('article');
                const button: Element | null = document.querySelector('form button');
                if (link === null || card === null || button === null) { throw new Error('Controles ausentes.'); }
                const buttonStyle: CSSStyleDeclaration = getComputedStyle(button);
                return {
                    body: ratio(body.color, body.backgroundColor),
                    link: ratio(getComputedStyle(link).color, getComputedStyle(card).backgroundColor),
                    button: ratio(buttonStyle.color, buttonStyle.backgroundColor),
                };
            });
            expect(ratios.body).toBeGreaterThanOrEqual(4.5);
            expect(ratios.link).toBeGreaterThanOrEqual(4.5);
            expect(ratios.button).toBeGreaterThanOrEqual(4.5);
            const favorite = page.getByRole('article', { name: examplePost.title })
                .getByRole('button', { name: 'Adicionar aos favoritos', exact: true });
            await favorite.focus();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Shift+Tab');
            await expect(favorite).toBeFocused();
            expect(await favorite.evaluate((element: HTMLElement): string => getComputedStyle(element).outlineStyle)).toBe('solid');
            await page.evaluate((): void => {
                localStorage.setItem('folio.session', JSON.stringify({ accessToken: 'e2e-access', refreshToken: 'e2e-refresh' }));
            });
            await page.goto('/admin');
            await expect(page.getByRole('button', { name: `Editar: ${examplePost.title}` })).toBeVisible();
            await noOverflow(page);
            await page.getByRole('button', { name: 'Nova publicação', exact: true }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
            await noOverflow(page);
        });
    }
}
