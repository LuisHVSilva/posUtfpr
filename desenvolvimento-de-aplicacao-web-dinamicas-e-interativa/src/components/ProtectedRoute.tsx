import { Loader, Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute(): ReactElement {
    const { status } = useAuth();
    const location = useLocation();
    if (status === 'restoring') {
        return (
            <Stack align="center" p="xl" role="status" aria-live="polite">
                <Loader aria-hidden="true" />
                <Text>Verificando sua sessão…</Text>
            </Stack>
        );
    }
    if (status === 'anonymous') {
        return (
            <Navigate to="/login" replace
                state={{ from: location.pathname + location.search + location.hash }} />
        );
    }
    return <Outlet />;
}
