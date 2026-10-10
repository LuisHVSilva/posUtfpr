import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { createPost, deletePost, getComments, getPost, listPosts, updatePost } from './posts';
import { mockApi, httpResponse } from '../test/mockApi';
import { testComments, testPost, testPosts } from '../test/postFixtures';
import type { PostDraft } from '../schemas/posts';

const draft: PostDraft = { title: 'Uma publicação nova', body: 'Conteúdo válido para a demonstração.', tags: ['teste'] };
const signal = (): AbortSignal => new AbortController().signal;

describe('Serviços de publicações', (): void => {
    it('pagina listagem e busca com parâmetros corretos e dados validados', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, testPosts));
        expect(await listPosts('', 1, signal())).toEqual(testPosts);
        await listPosts('natureza & vida', 2, signal());
        expect(adapter.mock.calls[0]?.[0].url).toBe('/posts');
        expect(adapter.mock.calls[0]?.[0].params).toEqual({ limit: 6, skip: 0 });
        expect(adapter.mock.calls[1]?.[0].url).toBe('/posts/search');
        expect(adapter.mock.calls[1]?.[0].params).toEqual({ limit: 6, skip: 6, q: 'natureza & vida' });
    });

    it('obtém artigo e comentários do ID solicitado', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(
            config, config.url?.endsWith('/comments') ? testComments : testPost,
        ));
        expect(await getPost(1, signal())).toEqual(testPost);
        expect(await getComments(1, signal())).toEqual(testComments);
        expect(adapter.mock.calls.map(([config]): string | undefined => config.url))
            .toEqual(['/posts/1', '/posts/1/comments']);
    });

    it('cria, edita e exclui com contratos e métodos corretos', async (): Promise<void> => {
        const adapter = mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config,
            config.method === 'delete' ? { id: 1, isDeleted: true, deletedOn: '2026-10-09' }
                : { ...testPost, ...draft },
        ));
        expect(await createPost(draft, 1, signal())).toMatchObject(draft);
        expect(await updatePost(1, draft, signal())).toMatchObject(draft);
        expect(await deletePost(1, signal())).toMatchObject({ id: 1, isDeleted: true });
        expect(adapter.mock.calls.map(([config]): string | undefined => config.method)).toEqual(['post', 'put', 'delete']);
        expect(JSON.parse(adapter.mock.calls[0]?.[0].data)).toEqual({ ...draft, userId: 1 });
        expect(JSON.parse(adapter.mock.calls[1]?.[0].data)).toEqual(draft);
    });

    it.each(['list', 'detail', 'comments', 'create', 'edit', 'delete'])(
        'rejeita resposta inválida de %s', async (operation: string): Promise<void> => {
            mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}));
            const calls: Record<string, () => Promise<unknown>> = {
                list: (): Promise<unknown> => listPosts('', 1, signal()),
                detail: (): Promise<unknown> => getPost(1, signal()),
                comments: (): Promise<unknown> => getComments(1, signal()),
                create: (): Promise<unknown> => createPost(draft, 1, signal()),
                edit: (): Promise<unknown> => updatePost(1, draft, signal()),
                delete: (): Promise<unknown> => deletePost(1, signal()),
            };
            const call: (() => Promise<unknown>) | undefined = calls[operation];
            if (call === undefined) { throw new Error('Operação de teste desconhecida.'); }
            await expect(call()).rejects.toThrow(/dados inválidos/);
        },
    );

    it('rejeita IDs de artigo, edição, exclusão e comentários incoerentes', async (): Promise<void> => {
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, testPost));
        await expect(getPost(2, signal())).rejects.toThrow(/diferente/);
        await expect(updatePost(2, draft, signal())).rejects.toThrow(/diferente/);
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, testComments));
        await expect(getComments(2, signal())).rejects.toThrow(/outra publicação/);
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {
            id: 1, isDeleted: true, deletedOn: '2026-10-09',
        }));
        await expect(deletePost(2, signal())).rejects.toThrow(/diferente/);
    });

    it('não envia formulário inválido e normaliza rede/HTTP', async (): Promise<void> => {
        const adapter = mockApi((): Promise<AxiosResponse<unknown>> => Promise.reject(new AxiosError('Network Error')));
        await expect(createPost({ ...draft, title: '' }, 1, signal())).rejects.toThrow(/dados inválidos/);
        expect(adapter).not.toHaveBeenCalled();
        await expect(listPosts('', 1, signal())).rejects.toThrow(/conexão/);
        mockApi((config): Promise<AxiosResponse<unknown>> => httpResponse(config, {}, 404));
        await expect(getPost(99999, signal())).rejects.toMatchObject({ status: 404 });
    });
});
