import { Alert, Anchor, Button, Paper, Stack, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/PageHeading';
import styles from './Pages.module.scss';
import { useRegister } from '../hooks/useRegister';
import { PasswordField } from '../components/PasswordField';

export function Register(): ReactElement {
    const { form, pending, error, success, submit } = useRegister();
    return (
        <div className={styles.formPage}>
            <PageHeading title="Cadastro demonstrativo" description="Conheça o fluxo de criação de um cadastro." />
            <Paper withBorder p="lg" className={styles.surface}>
                <form onSubmit={submit} noValidate aria-label="Cadastro demonstrativo" aria-busy={pending}>
                    <Stack>
                        <Alert title="Cadastro demonstrativo">Não cria uma conta válida para login.
                            Os dados não permanecem na DummyJSON. Use dados fictícios.</Alert>
                        <div aria-live="polite">
                            {error !== null && (
                                <Alert color="red" role="alert" title="Falha no cadastro">{error}</Alert>
                            )}
                            {pending && <Alert role="status">Enviando cadastro demonstrativo…</Alert>}
                            {success && (
                                <Alert color="teal" role="status" title="Demonstração concluída">
                                    A API simulou o cadastro. Nenhuma conta válida para login foi criada.
                                </Alert>
                            )}
                        </div>
                        <TextInput label="Nome" autoComplete="name" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('name')} />
                        <TextInput label="Nome de usuário" autoComplete="username" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('username')} />
                        <TextInput label="E-mail" type="email" autoComplete="email" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('email')} />
                        <PasswordField label="Senha" autoComplete="new-password" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('password')} />
                        <PasswordField label="Confirmar senha" autoComplete="new-password" disabled={pending}
                            errorProps={{ role: 'alert' }} required {...form.getInputProps('confirmPassword')} />
                        <Button type="submit" loading={pending} disabled={pending}>
                            Criar cadastro demonstrativo
                        </Button>
                        <Anchor component={Link} to="/login">Voltar para entrar</Anchor>
                    </Stack>
                </form>
            </Paper>
        </div>
    );
}
