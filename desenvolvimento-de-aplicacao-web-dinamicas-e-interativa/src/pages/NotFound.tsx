import { Button, Stack } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';

export function NotFound(): ReactElement {
    return (
        <Stack align="flex-start">
            <PageHeading title="404 — Página não encontrada"
                description="Este endereço não está disponível. Continue pela página inicial." />
            <Button component={Link} to="/">Voltar ao início</Button>
        </Stack>
    );
}
