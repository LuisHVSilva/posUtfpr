import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import styles from './Layout.module.scss';

export function PublicLayout(): ReactElement {
    return (
        <div className={styles.shell}>
            <Header />
            <main id="conteudo" tabIndex={-1} className={styles.content}><Outlet /></main>
            <footer className={styles.footer}>Folio · Um espaço para boas histórias.</footer>
        </div>
    );
}
