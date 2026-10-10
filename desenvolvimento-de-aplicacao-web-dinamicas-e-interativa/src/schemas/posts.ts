import { z } from 'zod';

export const postSchema = z.object({
    id: z.number().int().positive(),
    title: z.string().min(1),
    body: z.string().min(1),
    userId: z.number().int().positive(),
    tags: z.array(z.string()).default([]),
    reactions: z.object({ likes: z.number().nonnegative(), dislikes: z.number().nonnegative() }).optional(),
});

export const postsPageSchema = z.object({
    posts: z.array(postSchema),
    total: z.number().int().nonnegative(),
    skip: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
});

export const commentSchema = z.object({
    id: z.number().int().positive(),
    body: z.string().min(1),
    postId: z.number().int().positive(),
    user: z.object({ id: z.number().int().positive(), username: z.string().min(1), fullName: z.string().optional() }),
});
export const commentsPageSchema = z.object({
    comments: z.array(commentSchema),
    total: z.number().int().nonnegative(),
    skip: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
});
export const deletedPostSchema = z.object({
    id: z.number().int().positive(), isDeleted: z.literal(true), deletedOn: z.string().min(1),
});
export const postDraftSchema = z.object({
    title: z.string().trim().min(3, 'Use um título com pelo menos 3 caracteres.'),
    body: z.string().trim().min(10, 'Use um conteúdo com pelo menos 10 caracteres.'),
    tags: z.array(z.string().trim().min(1)),
});
export const postFormSchema = postDraftSchema.omit({ tags: true }).extend({ tagsText: z.string() });

export type Post = z.infer<typeof postSchema>;
export type PostsPage = z.infer<typeof postsPageSchema>;
export type PostComment = z.infer<typeof commentSchema>;
export type CommentsPage = z.infer<typeof commentsPageSchema>;
export type PostDraft = z.infer<typeof postDraftSchema>;
export type PostFormValues = z.infer<typeof postFormSchema>;
export type DeletedPost = z.infer<typeof deletedPostSchema>;

export interface PostRow {
    key: string;
    post: Post;
    local: boolean;
}

export function toPostDraft(values: PostFormValues): PostDraft {
    const tags: string[] = Array.from(new Set(values.tagsText.split(',')
        .map((tag: string): string => tag.trim()).filter((tag: string): boolean => tag.length > 0)));
    return { title: values.title.trim(), body: values.body.trim(), tags };
}

export function parsePostId(value: string | undefined): number | null {
    if (value === undefined || !/^\d+$/.test(value)) {
        return null;
    }
    const id: number = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}
