import { ActionIcon, Burger, Button, Collapse, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import type { ReactElement } from 'react';
import styles from './Header.module.scss';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
    onNavigate?: () => void;
}

function Navigation({ onNavigate }: NavigationProps): ReactElement {
    const { status, signOut } = useAuth();
    const logout = (): void => {
        signOut();
        onNavigate?.();
    };
    return (
        <>
            <NavLink to="/" end onClick={onNavigate}>Início</NavLink>
            {status === 'authenticated' ? (
                <>
                    <NavLink to="/admin" onClick={onNavigate}>Painel</NavLink>
                    <Button variant="subtle" onClick={logout}>Sair</Button>
                </>
            ) : <NavLink to="/login" onClick={onNavigate}>Entrar</NavLink>}
        </>
    );
}

export function Header(): ReactElement {
    const [opened, { toggle, close }] = useDisclosure(false);
    const scheme: 'light' | 'dark' = useComputedColorScheme('light');
    const { setColorScheme } = useMantineColorScheme();
    const toggleTheme = (): void => setColorScheme(scheme === 'light' ? 'dark' : 'light');

    return (
        <header className={styles.header}>
            <a href="#conteudo" className={styles.skip}>Ir para o conteúdo</a>
            <div className={styles.bar}>
                <NavLink to="/" className={styles.brand} onClick={close}>Folio<span>.</span></NavLink>
                <nav aria-label="Principal" className={styles.desktop}><Navigation /></nav>
                <div className={styles.controls}>
                    <ActionIcon variant="subtle" size="xl" onClick={toggleTheme}
                        aria-label={scheme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}>
                        <FontAwesomeIcon icon={scheme === 'light' ? faMoon : faSun} />
                    </ActionIcon>
                    <Burger opened={opened} onClick={toggle} className={styles.burger}
                        aria-label={opened ? 'Fechar menu' : 'Abrir menu'}
                        aria-expanded={opened} aria-controls="menu-mobile" size="sm" />
                </div>
            </div>
            <Collapse in={opened} className={styles.mobile}>
                <nav id="menu-mobile" aria-label="Menu móvel"><Navigation onNavigate={close} /></nav>
            </Collapse>
        </header>
    );
}
