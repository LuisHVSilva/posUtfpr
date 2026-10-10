import { Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import type { ReactElement } from 'react';
import { PageHeading } from '../components/PageHeading';
import { ContentState } from '../components/ContentState';
import { usePostDetails, type DetailsResult } from '../hooks/usePostDetails';
import type { PostComment } from '../schemas/posts';
import styles from './Pages.module.scss';
import { FavoriteButton } from '../components/FavoriteButton';

export function PostDetails(): ReactElement {
    const details: DetailsResult = usePostDetails();
    return (
        <Stack className={styles.article}>
            <Button variant="subtle" onClick={details.back} className={styles.createButton}
                leftSection={<FontAwesomeIcon icon={faArrowLeft} />}>Voltar</Button>
            <article>
                <PageHeading title={details.post?.title ?? (details.error === null ? 'Publicação' : 'Publicação indisponível')}
                    description="Um espaço para leitura e conversa." />
                <div aria-live="polite">
                    <ContentState loading={details.loading} loadingText="Carregando publicação…"
                        error={details.error} empty={false} retry={details.retry} />
                </div>
                {details.post !== null && <Stack>
                    <Group gap="xs">{details.post.tags.map((tag: string): ReactElement => <Badge key={tag}>{tag}</Badge>)}</Group>
                    <Text className={styles.body}>{details.post.body}</Text>
                    <Group><FavoriteButton postId={details.post.id} compact={false} /></Group>
                </Stack>}
            </article>
            {details.post !== null && <section aria-labelledby="comentarios-title" aria-live="polite">
                <Title id="comentarios-title" order={2} mb="md">Comentários</Title>
                <ContentState loading={details.commentsLoading} loadingText="Carregando comentários…"
                    error={details.commentsError} empty={details.comments.length === 0}
                    emptyText="Nenhum comentário nesta publicação." retry={details.retryComments} />
                <Stack>{details.comments.map((comment: PostComment): ReactElement => (
                    <Paper component="article" withBorder p="lg" key={comment.id} className={styles.surface}>
                        <Text fw={600}>{comment.user.fullName ?? comment.user.username}</Text>
                        <Text className={styles.body}>{comment.body}</Text>
                    </Paper>
                ))}</Stack>
            </section>}
        </Stack>
    );
}
