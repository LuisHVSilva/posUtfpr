import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from "./app/App.tsx";
import './shared/design-system/styles/styles.scss';
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./shared/services/queryClient.service.ts";
import ToastProvider from "./shared/contexts/toast/ToastProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <App/>
            </ToastProvider>
        </QueryClientProvider>
    </StrictMode>,
)
