import { type Page, type Route } from '@playwright/test';
import { postDraftSchema, type Post } from '../src/schemas/posts';

export const examplePost: Post = {
    id: 1, title: 'Uma história para explorar', body: 'Conteúdo completo de uma publicação determinística.',
    userId: 1, tags: ['leitura'], reactions: { likes: 3, dislikes: 0 },
};
const posts: Post[] = Array.from({ length: 12 }, (_, index: number): Post => ({
    ...examplePost, id: index + 1, title: index === 0 ? examplePost.title : `História ${index + 1}`,
}));

export async function interceptPosts(page: Page): Promise<void> {
    await page.route('https://dummyjson.com/posts**', async (route: Route): Promise<void> => {
        const url: URL = new URL(route.request().url());
        const path: string = url.pathname;
        const method: string = route.request().method();
        if (method === 'POST' || method === 'PUT') {
            const input: unknown = route.request().postDataJSON();
            const draft = postDraftSchema.parse(input);
            const id: number = method === 'POST' ? 252 : Number(path.split('/')[2]);
            await route.fulfill({ json: { ...examplePost, ...draft, id } });
        } else if (method === 'DELETE') {
            await route.fulfill({ json: { id: Number(path.split('/')[2]), isDeleted: true, deletedOn: '2026-10-09' } });
        } else if (path === '/posts' || path === '/posts/search') {
            const query: string = (url.searchParams.get('q') ?? '').toLocaleLowerCase();
            const filtered: Post[] = posts.filter((post: Post): boolean => post.title.toLocaleLowerCase().includes(query));
            const skip: number = Number(url.searchParams.get('skip') ?? '0');
            const limit: number = Number(url.searchParams.get('limit') ?? '6');
            await route.fulfill({ json: { posts: filtered.slice(skip, skip + limit), total: filtered.length, skip, limit } });
        } else if (path.endsWith('/comments')) {
            const postId: number = Number(path.split('/')[2]);
            await route.fulfill({ json: {
                comments: [{ id: 1, postId, body: 'Uma boa leitura.', user: { id: 2, username: 'leitora' } }],
                total: 1, skip: 0, limit: 1,
            } });
        } else {
            const id: number = Number(path.split('/')[2]);
            const post: Post | undefined = posts.find((item: Post): boolean => item.id === id);
            await route.fulfill({ status: post === undefined ? 404 : 200, json: post ?? {} });
        }
    });
}
