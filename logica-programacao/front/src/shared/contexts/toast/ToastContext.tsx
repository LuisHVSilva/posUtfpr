import {createContext} from "react";
import type {Toast} from "@shared/types/toast.type.ts";


interface ToastContextData {
    showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextData | null>(null);

export default ToastContext;
