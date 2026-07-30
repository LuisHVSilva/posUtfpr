import {useState, type ReactNode, useEffect, useCallback} from "react";
import ToastContext from "./ToastContext.tsx";
import {toastService} from "../../services/toast.service.ts";
// import "../../style/contexts/contexts.scss";
import type {Toast} from "../../types/toast.type.ts";


const ToastProvider = ({children}: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        ({type, message}: Omit<Toast, "id">) => {
            const id = crypto.randomUUID();

            setToasts((prev) => [...prev, {id, type, message}]);

            setTimeout(() => {
                removeToast(id);
            }, 4000);
        },
        [removeToast]
    );

    useEffect(() => {
        toastService.registerToast(showToast);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}

            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast--${toast.type}`}>
                        <span>{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)}><i className="fa-solid fa-x"></i></button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
