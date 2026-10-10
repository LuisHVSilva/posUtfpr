import { useEffect, useState, type ChangeEvent, type FormEvent, type RefObject } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { usePostList, type PostListResult } from './usePostList';
import { parsePostId, type Post } from '../schemas/posts';
import { useFavorites } from './useFavorites';
import { useHomeIntro } from './useHomeIntro';

interface FavoriteLink {
    id: number;
    title: string;
}

export interface HomeResult extends PostListResult {
    draft: string;
    page: number;
    featured: Post | null;
    remaining: Post[];
    returnTo: string;
    favorites: FavoriteLink[];
    favoritesWarning: string | null;
    featuredRef: RefObject<HTMLDivElement | null>;
    changeDraft: (event: ChangeEvent<HTMLInputElement>) => void;
    submit: (event: FormEvent<HTMLFormElement>) => void;
    changePage: (page: number) => void;
}

export function useHome(): HomeResult {
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const query: string = (params.get('q') ?? '').trim();
    const page: number = parsePostId(params.get('page') ?? undefined) ?? 1;
    const [draft, setDraft] = useState<string>(query);
    const list: PostListResult = usePostList(query, page);
    const { ids, warning } = useFavorites();
    const featuredRef: RefObject<HTMLDivElement | null> = useHomeIntro(list.data !== null && list.data.posts.length > 0);
    useEffect((): void => { setDraft(query); }, [query]);
    const featured: Post | null = list.data?.posts[0] ?? null;
    const remaining: Post[] = list.data?.posts.slice(1) ?? [];
    const favorites: FavoriteLink[] = ids.map((id: number): FavoriteLink => ({
        id, title: list.data?.posts.find((post: Post): boolean => post.id === id)?.title ?? `Publicação #${id}`,
    }));
    const changeDraft = (event: ChangeEvent<HTMLInputElement>): void => setDraft(event.currentTarget.value);
    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setParams(draft.trim() ? { q: draft.trim() } : {});
    };
    const changePage = (next: number): void => {
        setParams({ ...(query ? { q: query } : {}), page: String(next) });
    };
    return {
        ...list, draft, page, featured, remaining, favorites, favoritesWarning: warning, featuredRef,
        returnTo: location.pathname + location.search + location.hash,
        changeDraft, submit, changePage,
    };
}
