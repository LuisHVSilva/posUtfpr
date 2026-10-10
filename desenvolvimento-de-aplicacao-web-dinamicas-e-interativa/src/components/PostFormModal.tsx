import { Alert, Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { usePostForm } from '../hooks/usePostForm';
import type { Post, PostDraft } from '../schemas/posts';

interface PostFormModalProps {
    post: Post | null;
    pending: boolean;
    error: string | null;
    close: () => void;
    save: (draft: PostDraft) => Promise<void>;
}

export function PostFormModal({ post, pending, error, close, save }: PostFormModalProps): ReactElement {
    const { form, submit } = usePostForm(post, save);
    return (
        <Modal opened onClose={close} title={post === null ? 'Nova publicação' : 'Editar publicação'}
            withCloseButton={!pending} closeButtonProps={{ 'aria-label': 'Fechar formulário' }}
            closeOnClickOutside={!pending} closeOnEscape={!pending}>
            <form onSubmit={submit} noValidate aria-label="Formulário de publicação" aria-busy={pending}>
                <Stack>
                    <Text size="sm">Alterações demonstrativas: não permanecem na DummyJSON.
                        Serão perdidas ao recarregar ou sair do painel.</Text>
                    <div aria-live="polite">
                        {error !== null && <Alert color="red" role="alert">{error}</Alert>}
                        {pending && <Text role="status">Salvando publicação…</Text>}
                    </div>
                    <TextInput label="Título" data-autofocus required disabled={pending}
                        errorProps={{ role: 'alert' }} {...form.getInputProps('title')} />
                    <Textarea label="Conteúdo" required disabled={pending} autosize minRows={5}
                        errorProps={{ role: 'alert' }} {...form.getInputProps('body')} />
                    <TextInput label="Tags" description="Separe as tags por vírgula." disabled={pending}
                        errorProps={{ role: 'alert' }} {...form.getInputProps('tagsText')} />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={close} disabled={pending}>Cancelar</Button>
                        <Button type="submit" loading={pending} disabled={pending}>Salvar publicação</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
