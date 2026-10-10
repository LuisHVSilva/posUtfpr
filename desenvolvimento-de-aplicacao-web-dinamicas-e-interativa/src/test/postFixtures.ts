import type { CommentsPage, Post, PostsPage } from '../schemas/posts';

export const testPost: Post = {
    id: 1, title: 'Uma história para explorar', body: 'Este é o conteúdo completo de uma publicação de teste.',
    userId: 1, tags: ['história'], reactions: { likes: 3, dislikes: 0 },
};
export const testPosts: PostsPage = { posts: [testPost], total: 1, skip: 0, limit: 6 };
export const testComments: CommentsPage = {
    comments: [{ id: 1, postId: 1, body: 'Uma boa leitura.', user: { id: 2, username: 'leitora', fullName: 'Pessoa Leitora' } }],
    total: 1, skip: 0, limit: 1,
};
