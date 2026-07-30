import {useState} from "react";
import type {FormEvent} from "react";
import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import {pacientsService} from "../services/pacients.service";
import {toastService} from "../../../shared/services/toast.service";
import "../styles/pacients.scss";

type PatientRegistryModalProps = {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
};

export function PatientRegistryModal({open, onClose, onSaved}: PatientRegistryModalProps) {
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [birthday, setBirthday] = useState("");

    if (!open) return null;

    const resetForm = () => {
        setName("");
        setCpf("");
        setBirthday("");
    };

    const handleClose = () => {
        if (saving) {
            return;
        }

        resetForm();
        onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);

        try {
            await pacientsService.registerPatient({
                name,
                cpf,
                birthday,
            });
            await onSaved();
            toastService.success("Paciente registrado com sucesso.");
            resetForm();
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                toastService.error(error.message);
                return;
            }

            toastService.error("Erro ao registrar paciente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="pacients-modal" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleClose();
        }}>
            <section className="pacients-modal__content pacients-modal__content--compact" role="dialog" aria-modal="true"
                     aria-labelledby="registry-title">
                <header className="pacients-modal__header">
                    <h2 id="registry-title">Registrar Paciente</h2>
                    <button type="button" aria-label="Fechar registro" onClick={handleClose} disabled={saving}>
                        <Icon name="close"/>
                    </button>
                </header>

                <form className="edit-patient-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Nome Completo</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={saving}
                            required
                        />
                    </label>
                    <div className="edit-patient-form__grid">
                        <label>
                            <span>CPF</span>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(event) => setCpf(event.target.value)}
                                disabled={saving}
                                required
                            />
                        </label>
                        <label>
                            <span>Aniversario</span>
                            <input
                                type="date"
                                value={birthday}
                                onChange={(event) => setBirthday(event.target.value)}
                                disabled={saving}
                                required
                            />
                        </label>
                    </div>
                    <footer>
                        <Button type="button" variant="ghost" onClick={handleClose} disabled={saving}>Cancelar</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Registrando..." : "Registrar Paciente"}
                        </Button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
