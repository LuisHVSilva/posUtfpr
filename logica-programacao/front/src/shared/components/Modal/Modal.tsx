import type {ReactNode} from "react";
import {Icon} from "../Icon/Icon";
import "./Modal.scss";

type ModalProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    action: (formData: FormData) => void;
    children: ReactNode
};

export function Modal({open, title, onClose, action, children}: ModalProps) {
    if (!open) return null;
    return (
        <div className="modal" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <form className="modal__content" action={action}>
                <header className="modal__header">
                    <h2><Icon name="add"/>{title}</h2>

                    <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
                        <Icon name="close"/>
                    </button>
                </header>

                <div className="modal__body">{children}</div>
            </form>
        </div>
    );
}
