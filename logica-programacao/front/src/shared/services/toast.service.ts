import type {ToastType} from "../types/toast.type.ts";

type ShowToastFn = (data: { type: ToastType; message: string }) => void;

class ToastService {
    private showToastRef: ShowToastFn | null = null;

    registerToast(fn: ShowToastFn) {
        this.showToastRef = fn;
    }

    success(message: string) {
        this.showToastRef?.({type: "success", message});
    }

    error(message: string) {
        this.showToastRef?.({type: "error", message});
    }

    errorThrow(e: unknown) {
        if (e instanceof Error) {
            this.error(e.message);
        }

        this.error("Erro na operação");
    }

    warning(message: string) {
        this.showToastRef?.({type: "warning", message});
    }

    info(message: string) {
        this.showToastRef?.({type: "info", message});
    }
}

export const toastService = new ToastService();
