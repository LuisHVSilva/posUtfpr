import { Stack, Text, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import styles from './PageHeading.module.scss';

interface PageHeadingProps {
    title: string;
    description: string;
}

export function PageHeading({ title, description }: PageHeadingProps): ReactElement {
    return (
        <Stack gap="sm" className={styles.heading}>
            <Title order={1}>{title}</Title>
            <Text c="dimmed">{description}</Text>
        </Stack>
    );
}
