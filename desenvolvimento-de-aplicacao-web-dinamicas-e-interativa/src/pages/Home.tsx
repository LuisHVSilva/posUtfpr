import { Alert, Anchor, Button, Group, Pagination, Stack, Text, TextInput, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { PageHeading } from '../components/PageHeading';
import { ContentState } from '../components/ContentState';
import { PostCard } from '../components/PostCard';
import { useHome, type HomeResult } from '../hooks/useHome';
import type { Post } from '../schemas/posts';
import styles from './Pages.module.scss';
import { Link } from 'react-router-dom';

export function Home(): ReactElement {
    const home: HomeResult = useHome();
    return (
        <Stack gap="xl">
            <section className={styles.hero} aria-labelledby="home-title">
                <Text className={styles.eyebrow}>FOLIO / LEITURA E DESCOBERTA</Text>
                <div id="home-title"><PageHeading title="Histórias para explorar"
                    description="Uma pausa para descobrir ideias e novas perspectivas." /></div>
            </section>
            <form onSubmit={home.submit} aria-label="Pesquisa de publicações">
                <Group align="flex-end" className={styles.search}>
                    <TextInput label="Buscar publicações" value={home.draft} onChange={home.changeDraft} />
                    <Button type="submit" disabled={home.loading}>Buscar</Button>
                </Group>
            </form>
            <section aria-labelledby="publicacoes-title" aria-live="polite" aria-busy={home.loading}>
                <Title id="publicacoes-title" order={2} mb="md">Publicações</Title>
                <ContentState loading={home.loading} error={home.error}
                    empty={home.featured === null} retry={home.retry} />
                {home.featured !== null && (
                    <Stack gap="lg">
                        <div className={styles.bento}>
                            <div ref={home.featuredRef} className={styles.featured}>
                                <PostCard post={home.featured} featured returnTo={home.returnTo} />
                            </div>
                            {home.remaining.map((post: Post): ReactElement => (
                                <div key={post.id} className={styles.secondary}>
                                    <PostCard post={post} returnTo={home.returnTo} />
                                </div>
                            ))}
                        </div>
                        <Text size="sm" c="dimmed">{home.data?.total} publicações encontradas.</Text>
                    </Stack>
                )}
            </section>
            {home.pageCount > 1 && <Pagination total={home.pageCount} value={home.page}
                onChange={home.changePage} disabled={home.loading} siblings={0} boundaries={1}
                className={styles.pagination} aria-label="Páginas de publicações" />}
            <section aria-labelledby="favoritos-title" aria-live="polite">
                <Title id="favoritos-title" order={2} mb="md">Favoritos</Title>
                {home.favoritesWarning !== null && <Alert color="yellow" role="alert">{home.favoritesWarning}</Alert>}
                {home.favorites.length === 0 ? <Text>Nenhuma publicação nos favoritos.</Text> : (
                    <Stack component="ul" className={styles.favorites}>
                        {home.favorites.map((favorite): ReactElement => (
                            <li key={favorite.id}><Anchor component={Link} to={`/posts/${favorite.id}`}
                                state={{ from: home.returnTo }} aria-label={`Abrir favorito: ${favorite.title}`}>
                                {favorite.title}
                            </Anchor></li>
                        ))}
                    </Stack>
                )}
            </section>
        </Stack>
    );
}
