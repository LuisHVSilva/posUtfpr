import type {FormEvent} from "react";
import {useEffect, useState} from "react";
import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import type {PatientRecord} from "../types/pacients.types";
import {pacientsService} from "../services/pacients.service";
import {toastService} from "../../../shared/services/toast.service";
import "../styles/pacients.scss";

type EditPatientModalProps = {
    patient: PatientRecord | null;
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
};

export function EditPatientModal({patient, open, onClose, onSaved}: EditPatientModalProps) {
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [birthday, setBirthday] = useState("");

    useEffect(() => {
        if (!patient) {
            setName("");
            setCpf("");
            setBirthday("");
            return;
        }

        setName(patient.name);
        setCpf(patient.cpf);
        setBirthday(patient.birthDateIso);
    }, [patient]);

    if (!open) return null;

    const handleClose = () => {
        setSaving(false);
        onClose();
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!patient) {
            return;
        }

        setSaving(true);

        try {
            await pacientsService.updatePatient(patient.recordId, {
                name,
                cpf,
                birthday,
            });
            await onSaved();
            toastService.success("Paciente atualizado com sucesso.");
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                toastService.error(error.message);
                return;
            }

            toastService.error("Erro ao atualizar paciente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="pacients-modal" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleClose();
        }}>
            <section className="pacients-modal__content pacients-modal__content--compact" role="dialog"
                     aria-modal="true" aria-labelledby="edit-patient-title">
                <header className="pacients-modal__header">
                    <h2 id="edit-patient-title">Editar Ficha do Paciente</h2>
                    <button type="button" aria-label="Fechar edicao" onClick={handleClose}><Icon name="close"/></button>
                </header>

                <form className="edit-patient-form" onSubmit={handleSave}>
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
                            <span>Data de Nascimento</span>
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
                        <Button type="submit" disabled={saving || !patient}>
                            {saving ? "Salvando..." : "Salvar Alteracoes"}
                        </Button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
