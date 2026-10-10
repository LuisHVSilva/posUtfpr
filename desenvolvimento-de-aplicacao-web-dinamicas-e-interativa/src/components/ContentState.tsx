import { Alert, Button, Loader, Paper, Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';

interface ContentStateProps {
    loading: boolean;
    error: string | null;
    empty: boolean;
    loadingText?: string;
    emptyText?: string;
    retry: () => void;
}

export function ContentState({ loading, error, empty, retry,
    loadingText = 'Carregando publicações…', emptyText = 'Nenhuma publicação encontrada.',
}: ContentStateProps): ReactElement | null {
    if (loading) {
        return <Stack align="center" p="xl" role="status"><Loader aria-hidden="true" /><Text>{loadingText}</Text></Stack>;
    }
    if (error !== null) {
        return (
            <Alert color="red" role="alert" title="Não foi possível carregar">
                <Stack gap="sm"><Text>{error}</Text><Button onClick={retry}>Tentar novamente</Button></Stack>
            </Alert>
        );
    }
    return empty ? <Paper withBorder p="lg"><Text role="status">{emptyText}</Text></Paper> : null;
}
