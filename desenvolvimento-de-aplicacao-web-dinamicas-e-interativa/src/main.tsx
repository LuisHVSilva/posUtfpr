import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import './styles/global.scss';
import { AppProviders } from './app/AppProviders';
import { AppRoutes } from './app/AppRoutes';
import { restorePagesRoute } from './app/pagesRouting';

restorePagesRoute();

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement === null) {
    throw new Error('O elemento raiz do Folio não foi encontrado.');
}
const root: Root = createRoot(rootElement);
root.render(
    <StrictMode>
        <AppProviders>
            <BrowserRouter basename={import.meta.env.BASE_URL}><AppRoutes /></BrowserRouter>
        </AppProviders>
    </StrictMode>,
);
