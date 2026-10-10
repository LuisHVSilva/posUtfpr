import { ActionIcon, Button } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import type { ReactElement } from 'react';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
    postId: number;
    compact?: boolean;
}

export function FavoriteButton({ postId, compact = true }: FavoriteButtonProps): ReactElement {
    const { isFavorite, toggle } = useFavorites();
    const active: boolean = isFavorite(postId);
    const label: string = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    const onClick = (): void => toggle(postId);
    const icon: ReactElement = <FontAwesomeIcon icon={faHeart} />;
    return compact ? (
        <ActionIcon size="xl" variant={active ? 'filled' : 'outline'} type="button"
            aria-label={label} title={label} aria-pressed={active} onClick={onClick}>{icon}</ActionIcon>
    ) : (
        <Button size="md" variant={active ? 'filled' : 'outline'} type="button"
            aria-pressed={active} onClick={onClick} leftSection={icon}>{label}</Button>
    );
}
