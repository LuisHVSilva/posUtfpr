import { Alert, Button, Group, Modal, Pagination, Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { PageHeading } from '../components/PageHeading';
import { ContentState } from '../components/ContentState';
import { PostTable } from '../components/PostTable';
import { PostFormModal } from '../components/PostFormModal';
import { useAdmin, type AdminResult } from '../hooks/useAdmin';
import styles from './Pages.module.scss';

export function Admin(): ReactElement {
    const admin: AdminResult = useAdmin();
    return (
        <Stack>
            <PageHeading title="Painel de publicações" description="Gerenciamento demonstrativo do Folio." />
            <Alert title="Demonstração autenticada">
                Este painel exige login, mas não representa uma permissão administrativa real.
                Alterações demonstrativas: não permanecem na DummyJSON.
                São perdidas ao recarregar ou sair do painel.
            </Alert>
            <Text size="sm" c="dimmed">Itens recém-criados existem somente nesta demonstração;
                editar ou excluir esses itens altera apenas a lista local. A paginação considera os registros
                da API; novos itens locais aparecem acima em todas as páginas.</Text>
            <Button onClick={admin.create} disabled={admin.pending || admin.loading}
                className={styles.createButton}>Nova publicação</Button>
            <div aria-live="polite">
                {admin.success !== null && <Alert color="teal" role="status">{admin.success}</Alert>}
                <ContentState loading={admin.loading} error={admin.error} empty={admin.rows.length === 0}
                    emptyText="Nenhuma publicação nesta página da demonstração." retry={admin.retry} />
            </div>
            {admin.rows.length > 0 && <PostTable rows={admin.rows} disabled={admin.pending || admin.loading}
                edit={admin.edit} requestDelete={admin.requestDelete} />}
            {admin.data !== null && <Text size="sm" c="dimmed">{admin.data.total} publicações na API.</Text>}
            {admin.pageCount > 1 && <Pagination total={admin.pageCount} value={admin.page}
                onChange={admin.changePage} disabled={admin.pending || admin.loading}
                siblings={0} boundaries={1} className={styles.pagination} aria-label="Páginas do painel" />}
            {admin.editor !== undefined && <PostFormModal key={admin.editor?.key ?? 'new'}
                post={admin.editor?.post ?? null} pending={admin.pending} error={admin.mutationError}
                close={admin.closeEditor} save={admin.save} />}
            <Modal opened={admin.deleting !== null} onClose={admin.closeDelete} title="Excluir publicação?"
                withCloseButton={!admin.pending} closeButtonProps={{ 'aria-label': 'Fechar confirmação' }}
                closeOnClickOutside={!admin.pending} closeOnEscape={!admin.pending}>
                <Stack>
                    <Text>Confirma a exclusão de “{admin.deleting?.post.title}” nesta demonstração?</Text>
                    <div aria-live="polite">
                        {admin.mutationError !== null && <Alert color="red" role="alert">{admin.mutationError}</Alert>}
                        {admin.pending && <Text role="status">Excluindo publicação…</Text>}
                    </div>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={admin.closeDelete} disabled={admin.pending}>Cancelar</Button>
                        <Button color="red" onClick={admin.confirmDelete} loading={admin.pending}
                            disabled={admin.pending}>Confirmar exclusão</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
