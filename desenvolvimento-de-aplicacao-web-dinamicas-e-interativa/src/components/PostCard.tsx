import { Anchor, Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../schemas/posts';
import styles from './PostCard.module.scss';
import { FavoriteButton } from './FavoriteButton';

interface PostCardProps {
    post: Post;
    featured?: boolean;
    returnTo: string;
}

export function PostCard({ post, featured = false, returnTo }: PostCardProps): ReactElement {
    return (
        <Card component="article" aria-label={post.title} withBorder padding="lg"
            className={`${styles.card} ${featured ? styles.featured : ''}`}>
            <Stack>
                {featured && <Text size="xs" c="dimmed">DESTAQUE EDITORIAL</Text>}
                <Title order={featured ? 2 : 3}>{post.title}</Title>
                <Text>{post.body.length > 190 ? `${post.body.slice(0, 190)}…` : post.body}</Text>
                <Group gap="xs">{post.tags.map((tag: string): ReactElement => <Badge key={tag}>{tag}</Badge>)}</Group>
                {post.reactions !== undefined && <Text size="sm" c="dimmed">{post.reactions.likes} curtidas</Text>}
                <Group justify="space-between">
                    <Anchor component={Link} to={`/posts/${post.id}`} state={{ from: returnTo }}
                        aria-label={`Ler publicação: ${post.title}`}>Ler publicação</Anchor>
                    <FavoriteButton postId={post.id} />
                </Group>
            </Stack>
        </Card>
    );
}
