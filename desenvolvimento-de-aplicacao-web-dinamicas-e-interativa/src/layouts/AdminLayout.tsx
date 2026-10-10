import type { ReactElement } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import styles from './Layout.module.scss';

export function AdminLayout(): ReactElement {
    return (
        <div className={styles.shell}>
            <Header />
            <main id="conteudo" tabIndex={-1} className={styles.content}>
                <nav aria-label="Painel" className={styles.adminNav}>
                    <NavLink to="/">Voltar ao início</NavLink>
                    <NavLink to="/admin">Painel</NavLink>
                </nav>
                <Outlet />
            </main>
            <footer className={styles.footer}>Folio · Demonstração acadêmica.</footer>
        </div>
    );
}
