import type { z } from 'zod';
import { api, ApiError } from './api';
import {
    commentsPageSchema, deletedPostSchema, postDraftSchema, postSchema, postsPageSchema,
    type CommentsPage, type DeletedPost, type Post, type PostComment, type PostDraft, type PostsPage,
} from '../schemas/posts';

export const POSTS_PAGE_SIZE: number = 6;

function validated<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) {
        throw new ApiError('A API retornou dados inválidos de publicações. Tente novamente.');
    }
    return result.data;
}

export async function listPosts(query: string, page: number, signal: AbortSignal): Promise<PostsPage> {
    const response = await api.get<unknown>(query.length > 0 ? '/posts/search' : '/posts', {
        signal, params: { limit: POSTS_PAGE_SIZE, skip: (page - 1) * POSTS_PAGE_SIZE, ...(query ? { q: query } : {}) },
    });
    return validated(postsPageSchema, response.data);
}

export async function getPost(id: number, signal: AbortSignal): Promise<Post> {
    const response = await api.get<unknown>(`/posts/${id}`, { signal });
    const post: Post = validated(postSchema, response.data);
    if (post.id !== id) {
        throw new ApiError('A API retornou uma publicação diferente da solicitada.');
    }
    return post;
}

export async function getComments(id: number, signal: AbortSignal): Promise<CommentsPage> {
    const response = await api.get<unknown>(`/posts/${id}/comments`, { signal });
    const data: CommentsPage = validated(commentsPageSchema, response.data);
    if (data.comments.some((comment: PostComment): boolean => comment.postId !== id)) {
        throw new ApiError('A API retornou comentários de outra publicação.');
    }
    return data;
}

export async function createPost(draft: PostDraft, userId: number, signal: AbortSignal): Promise<Post> {
    const input: PostDraft = validated(postDraftSchema, draft);
    const response = await api.post<unknown>('/posts/add', { ...input, userId }, { signal });
    return validated(postSchema, response.data);
}

export async function updatePost(id: number, draft: PostDraft, signal: AbortSignal): Promise<Post> {
    const input: PostDraft = validated(postDraftSchema, draft);
    const response = await api.put<unknown>(`/posts/${id}`, input, { signal });
    const post: Post = validated(postSchema, response.data);
    if (post.id !== id) {
        throw new ApiError('A API retornou uma publicação diferente da editada.');
    }
    return post;
}

export async function deletePost(id: number, signal: AbortSignal): Promise<DeletedPost> {
    const response = await api.delete<unknown>(`/posts/${id}`, { signal });
    const deleted: DeletedPost = validated(deletedPostSchema, response.data);
    if (deleted.id !== id) {
        throw new ApiError('A API retornou uma exclusão diferente da solicitada.');
    }
    return deleted;
}
