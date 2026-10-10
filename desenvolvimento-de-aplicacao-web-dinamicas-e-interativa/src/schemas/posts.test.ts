import { describe, expect, it } from 'vitest';
import { parsePostId, postFormSchema, postSchema, postsPageSchema, toPostDraft, type PostFormValues } from './posts';
import { testPost, testPosts } from '../test/postFixtures';

describe('Contratos e formulário de publicações', (): void => {
    it('valida posts e envelope, aceitando metadados opcionais', (): void => {
        expect(postSchema.safeParse(testPost).success).toBe(true);
        expect(postSchema.safeParse({ id: 1, userId: 1, title: 'Título', body: 'Texto' }).data?.tags).toEqual([]);
        expect(postSchema.safeParse({ ...testPost, id: '1' }).success).toBe(false);
        expect(postsPageSchema.safeParse({ ...testPosts, total: -1 }).success).toBe(false);
        expect(postsPageSchema.safeParse({ ...testPosts, posts: [{ title: 'Incomplete' }] }).success).toBe(false);
    });
    it('valida título/conteúdo e converte tags sem modificar o formulário', (): void => {
        const values: PostFormValues = {
            title: '  Novo título ', body: ' Um texto válido para a publicação. ', tagsText: ' vida, , leitura, vida ',
        };
        expect(postFormSchema.safeParse(values).success).toBe(true);
        expect(toPostDraft(values)).toEqual({ title: 'Novo título', body: 'Um texto válido para a publicação.', tags: ['vida', 'leitura'] });
        expect(values.tagsText).toBe(' vida, , leitura, vida ');
        expect(postFormSchema.safeParse({ title: 'a', body: 'short', tagsText: '' }).success).toBe(false);
        expect(toPostDraft({ ...values, tagsText: '' }).tags).toEqual([]);
    });
    it.each([undefined, '', '0', '-1', '1.5', 'abc', '1e2', '9007199254740992'])(
        'rejeita identificador inválido %s', (value: string | undefined): void => { expect(parsePostId(value)).toBeNull(); },
    );
    it('aceita ID positivo válido', (): void => { expect(parsePostId('15')).toBe(15); });
});
