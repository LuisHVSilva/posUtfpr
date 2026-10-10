import { Badge, Button, Group, Table, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import type { PostRow } from '../schemas/posts';
import styles from './PostTable.module.scss';

interface PostTableProps {
    rows: PostRow[];
    disabled: boolean;
    edit: (row: PostRow) => void;
    requestDelete: (row: PostRow) => void;
}

export function PostTable({ rows, disabled, edit, requestDelete }: PostTableProps): ReactElement {
    return (
        <div className={styles.scroll} role="region" aria-label="Lista de publicações" tabIndex={0}>
            <Table className={styles.table}>
                <Table.Thead><Table.Tr><Table.Th>Título</Table.Th><Table.Th>Tags</Table.Th>
                    <Table.Th>Ações</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>{rows.map((row: PostRow): ReactElement => (
                    <Table.Tr key={row.key}>
                        <Table.Td><Text fw={600}>{row.post.title}</Text>
                            {row.local && <Badge variant="light">Somente nesta demonstração</Badge>}</Table.Td>
                        <Table.Td><Text size="sm">{row.post.tags.join(', ') || 'Sem tags'}</Text></Table.Td>
                        <Table.Td><Group gap="xs" wrap="nowrap">
                            <Button size="xs" variant="light" disabled={disabled}
                                aria-label={`Editar: ${row.post.title}`} onClick={(): void => edit(row)}>Editar</Button>
                            <Button size="xs" color="red" variant="light" disabled={disabled}
                                aria-label={`Excluir: ${row.post.title}`}
                                onClick={(): void => requestDelete(row)}>Excluir</Button>
                        </Group></Table.Td>
                    </Table.Tr>
                ))}</Table.Tbody>
            </Table>
        </div>
    );
}
