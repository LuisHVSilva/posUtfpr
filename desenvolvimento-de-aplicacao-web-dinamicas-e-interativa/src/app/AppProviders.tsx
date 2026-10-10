import {
    createTheme, MantineProvider, PasswordInput, Textarea, TextInput, type MantineThemeOverride,
} from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthProvider';
import { FavoritesProvider } from '../contexts/FavoritesProvider';

const theme: MantineThemeOverride = createTheme({
    primaryColor: 'teal',
    primaryShade: 9,
    fontFamily: 'Arial, Helvetica, sans-serif',
    headings: { fontFamily: 'Georgia, Times New Roman, serif' },
    defaultRadius: 'md',
    components: {
        TextInput: TextInput.extend({ defaultProps: { size: 'md' } }),
        PasswordInput: PasswordInput.extend({ defaultProps: { size: 'md' } }),
        Textarea: Textarea.extend({ defaultProps: { size: 'md' } }),
    },
});

export function AppProviders({ children }: { children?: ReactNode }): ReactElement {
    return (
        <MantineProvider theme={theme} defaultColorScheme="light">
            <AuthProvider><FavoritesProvider>{children}</FavoritesProvider></AuthProvider>
        </MantineProvider>
    );
}
