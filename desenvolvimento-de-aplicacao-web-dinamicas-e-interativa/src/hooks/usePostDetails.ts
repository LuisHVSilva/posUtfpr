import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { getComments, getPost } from '../services/posts';
import { ApiError, errorMessage } from '../services/api';
import { parsePostId, type CommentsPage, type Post, type PostComment } from '../schemas/posts';

const returnSchema = z.object({ from: z.string().regex(/^\/(?:\?[^#]*)?(?:#.*)?$/) });

export interface DetailsResult {
    post: Post | null;
    loading: boolean;
    error: string | null;
    comments: PostComment[];
    commentsLoading: boolean;
    commentsError: string | null;
    back: () => void;
    retry: () => void;
    retryComments: () => void;
}

export function usePostDetails(): DetailsResult {
    const { id: parameter } = useParams<{ id: string }>();
    const id: number | null = parsePostId(parameter);
    const location = useLocation();
    const navigate = useNavigate();
    const state: unknown = location.state;
    const returnTo = returnSchema.safeParse(state);
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [revision, setRevision] = useState<number>(0);
    const [commentsRevision, setCommentsRevision] = useState<number>(0);

    useEffect((): (() => void) => {
        const controller: AbortController = new AbortController();
        setPost(null);
        setError(null);
        setLoading(id !== null);
        if (id === null) {
            setError('O identificador da publicação é inválido.');
        } else {
            void getPost(id, controller.signal).then((next: Post): void => {
                if (!controller.signal.aborted) { setPost(next); }
            }).catch((failure: unknown): void => {
                if (!controller.signal.aborted) {
                    setError(failure instanceof ApiError && failure.status === 404
                        ? 'Publicação não encontrada.' : errorMessage(failure));
                }
            }).finally((): void => {
                if (!controller.signal.aborted) { setLoading(false); }
            });
        }
        return (): void => { controller.abort(); };
    }, [id, revision]);

    useEffect((): (() => void) => {
        const controller: AbortController = new AbortController();
        setComments([]);
        setCommentsError(null);
        setCommentsLoading(id !== null);
        if (id !== null) {
            void getComments(id, controller.signal).then((next: CommentsPage): void => {
                if (!controller.signal.aborted) { setComments(next.comments); }
            }).catch((failure: unknown): void => {
                if (!controller.signal.aborted) { setCommentsError(errorMessage(failure)); }
            }).finally((): void => {
                if (!controller.signal.aborted) { setCommentsLoading(false); }
            });
        }
        return (): void => { controller.abort(); };
    }, [id, commentsRevision]);

    const back = (): void => { void navigate(returnTo.success ? returnTo.data.from : '/'); };
    const retry = (): void => setRevision((current: number): number => current + 1);
    const retryComments = (): void => setCommentsRevision((current: number): number => current + 1);
    return { post, loading, error, comments, commentsLoading, commentsError, back, retry, retryComments };
}
