import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { usePostList, type PostListResult } from './usePostList';
import { createPost, deletePost, updatePost } from '../services/posts';
import { ApiError, errorMessage } from '../services/api';
import type { Post, PostDraft, PostRow } from '../schemas/posts';

export interface AdminResult extends PostListResult {
    page: number;
    rows: PostRow[];
    editor: PostRow | null | undefined;
    deleting: PostRow | null;
    pending: boolean;
    mutationError: string | null;
    success: string | null;
    changePage: (page: number) => void;
    create: () => void;
    edit: (row: PostRow) => void;
    requestDelete: (row: PostRow) => void;
    closeEditor: () => void;
    closeDelete: () => void;
    save: (draft: PostDraft) => Promise<void>;
    confirmDelete: () => Promise<void>;
}

export function useAdmin(): AdminResult {
    const { user } = useAuth();
    const [page, setPage] = useState<number>(1);
    const list: PostListResult = usePostList('', page);
    const [created, setCreated] = useState<PostRow[]>([]);
    const [edited, setEdited] = useState<Record<number, Post>>({});
    const [deleted, setDeleted] = useState<number[]>([]);
    const [editor, setEditor] = useState<PostRow | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<PostRow | null>(null);
    const [pending, setPending] = useState<boolean>(false);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const request = useRef<AbortController | null>(null);
    const localCounter = useRef<number>(0);
    useEffect((): (() => void) => (): void => { request.current?.abort(); }, []);

    const remote: PostRow[] = (list.data?.posts ?? []).filter((post: Post): boolean => !deleted.includes(post.id))
        .map((post: Post): PostRow => ({ key: `api-${post.id}`, post: edited[post.id] ?? post, local: false }));
    const rows: PostRow[] = [...created, ...remote];

    const clearFeedback = (): void => { setMutationError(null); setSuccess(null); };
    const create = (): void => { clearFeedback(); setEditor(null); };
    const edit = (row: PostRow): void => { clearFeedback(); setEditor(row); };
    const requestDelete = (row: PostRow): void => { clearFeedback(); setDeleting(row); };
    const closeEditor = (): void => { if (!pending) { setEditor(undefined); setMutationError(null); } };
    const closeDelete = (): void => { if (!pending) { setDeleting(null); setMutationError(null); } };

    const save = async (draft: PostDraft): Promise<void> => {
        if (request.current !== null || editor === undefined) { return; }
        const controller: AbortController = new AbortController();
        request.current = controller;
        setPending(true);
        clearFeedback();
        try {
            if (user === null) { throw new ApiError('Entre novamente para gerenciar publicações.'); }
            if (editor === null) {
                const post: Post = await createPost(draft, user.id, controller.signal);
                if (controller.signal.aborted) { return; }
                const row: PostRow = { key: `local-${++localCounter.current}`, post, local: true };
                setCreated((current: PostRow[]): PostRow[] => [row, ...current]);
            } else if (editor.local) {
                // A API reutiliza IDs simulados e não conhece os posts recém-criados.
                setCreated((current: PostRow[]): PostRow[] => current.map((row: PostRow): PostRow =>
                    row.key === editor.key ? { ...row, post: { ...row.post, ...draft } } : row));
            } else {
                const post: Post = await updatePost(editor.post.id, draft, controller.signal);
                if (controller.signal.aborted) { return; }
                setEdited((current: Record<number, Post>): Record<number, Post> => ({ ...current, [post.id]: post }));
            }
            setSuccess(editor === null ? 'Publicação criada nesta demonstração.' : 'Publicação atualizada nesta demonstração.');
            setEditor(undefined);
        } catch (failure: unknown) {
            if (!controller.signal.aborted) { setMutationError(errorMessage(failure)); }
        } finally {
            if (!controller.signal.aborted) { setPending(false); request.current = null; }
        }
    };

    const confirmDelete = async (): Promise<void> => {
        if (request.current !== null || deleting === null) { return; }
        const controller: AbortController = new AbortController();
        request.current = controller;
        setPending(true);
        clearFeedback();
        try {
            if (deleting.local) {
                setCreated((current: PostRow[]): PostRow[] => current.filter((row: PostRow): boolean => row.key !== deleting.key));
            } else {
                await deletePost(deleting.post.id, controller.signal);
                if (controller.signal.aborted) { return; }
                setDeleted((current: number[]): number[] => [...current, deleting.post.id]);
            }
            setSuccess('Publicação excluída nesta demonstração.');
            setDeleting(null);
        } catch (failure: unknown) {
            if (!controller.signal.aborted) { setMutationError(errorMessage(failure)); }
        } finally {
            if (!controller.signal.aborted) { setPending(false); request.current = null; }
        }
    };

    return {
        ...list, page, rows, editor, deleting, pending, mutationError, success,
        changePage: setPage, create, edit, requestDelete, closeEditor, closeDelete, save, confirmDelete,
    };
}
