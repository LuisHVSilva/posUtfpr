import { expect, test, type Page } from '@playwright/test';
import { interceptPosts } from './post-fixtures';

const routes: string[] = ['/', '/posts/1', '/login', '/cadastro', '/admin', '/inexistente'];
const widths: number[] = [320, 1280];

for (const width of widths) {
    test(`telas e navegação sem overflow em ${width}px`, async ({ page }): Promise<void> => {
        const errors: string[] = [];
        await interceptPosts(page);
        page.on('pageerror', (error: Error): void => { errors.push(error.message); });
        await page.setViewportSize({ width, height: 900 });
        for (const route of routes) {
            await page.goto(route);
            await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
            await expect(page.getByRole('main')).toBeVisible();
            await expect(page.getByRole('banner')).toBeVisible();
            await expect(page.getByRole('contentinfo')).toBeVisible();
            const overflow: boolean = await page.evaluate((): boolean =>
                document.documentElement.scrollWidth > window.innerWidth);
            expect(overflow, route).toBe(false);
        }
        await page.goto('/');
        if (width === 320) {
            await page.getByRole('button', { name: 'Abrir menu' }).click();
        }
        await page.getByRole('link', { name: 'Entrar', exact: true }).click();
        await expect(page).toHaveURL(/\/login$/);
        await page.getByRole('link', { name: 'Criar cadastro demonstrativo' }).click();
        await expect(page).toHaveURL(/\/cadastro$/);
        await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
        await checkNoOverflow(page);
        expect(errors).toEqual([]);
    });
}

async function checkNoOverflow(page: Page): Promise<void> {
    expect(await page.evaluate((): boolean =>
        document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
