import { Alert, Anchor, Button, Paper, Stack, Text, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import styles from './Pages.module.scss';
import { useLogin } from '../hooks/useLogin';
import { PasswordField } from '../components/PasswordField';

export function Login(): ReactElement {
    const { form, pending, error, submit } = useLogin();
    return (
        <div className={styles.formPage}>
            <PageHeading title="Entre no Folio" description="Seu espaço para gerenciar publicações." />
            <Paper withBorder p="lg" className={styles.surface}>
                <form onSubmit={submit} noValidate aria-label="Login" aria-busy={pending}>
                    <Stack>
                        <Text size="sm" c="dimmed">Use uma conta de teste da DummyJSON.</Text>
                        <div aria-live="polite">
                            {error !== null && (
                                <Alert color="red" role="alert" title="Não foi possível entrar">{error}</Alert>
                            )}
                            {pending && <Text role="status">Verificando acesso…</Text>}
                        </div>
                        <TextInput label="Nome de usuário" autoComplete="username" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('username')} />
                        <PasswordField label="Senha" autoComplete="current-password" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('password')} />
                        <Button type="submit" loading={pending} disabled={pending}>Entrar</Button>
                        <Anchor component={Link} to="/cadastro">Criar cadastro demonstrativo</Anchor>
                        <Anchor component={Link} to="/">Voltar ao início</Anchor>
                    </Stack>
                </form>
            </Paper>
        </div>
    );
}
