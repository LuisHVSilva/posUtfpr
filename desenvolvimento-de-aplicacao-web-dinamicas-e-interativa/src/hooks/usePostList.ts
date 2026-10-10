import { useEffect, useState } from 'react';
import { listPosts, POSTS_PAGE_SIZE } from '../services/posts';
import { errorMessage } from '../services/api';
import type { PostsPage } from '../schemas/posts';

export interface PostListResult {
    data: PostsPage | null;
    loading: boolean;
    error: string | null;
    pageCount: number;
    retry: () => void;
}

export function usePostList(query: string, page: number): PostListResult {
    const [data, setData] = useState<PostsPage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState<number>(0);

    useEffect((): (() => void) => {
        const controller: AbortController = new AbortController();
        setLoading(true);
        setError(null);
        setData(null);
        void listPosts(query, page, controller.signal).then((next: PostsPage): void => {
            if (!controller.signal.aborted) {
                setData(next);
            }
        }).catch((failure: unknown): void => {
            if (!controller.signal.aborted) {
                setError(errorMessage(failure));
            }
        }).finally((): void => {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        });
        return (): void => { controller.abort(); };
    }, [query, page, revision]);

    const pageCount: number = Math.max(1, Math.ceil((data?.total ?? 0) / POSTS_PAGE_SIZE));
    const retry = (): void => setRevision((current: number): number => current + 1);
    return { data, loading, error, pageCount, retry };
}
