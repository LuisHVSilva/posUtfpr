import type {FormEvent} from "react";
import {useState} from "react";
import {Button} from "../../../shared/components/Button/Button";
import {Modal} from "../../../shared/components/Modal/Modal";
import {Icon} from "../../../shared/components/Icon/Icon";

export function RegisterAttendanceModal({open, onClose}: { open: boolean; onClose: () => void }) {
    const [emergency, setEmergency] = useState(false);
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClose();
    };

    return (
        <Modal open={open} title="Registrar Novo Atendimento" onClose={onClose} onSubmit={handleSubmit}>
            <div className="form-grid">
                <label>Nome completo
                    <input required placeholder="Nome do paciente"/>
                </label>

                <label>CPF
                    <input placeholder="000.000.000-00"/>
                </label>

                <label>Data de nascimento
                    <input type="date"/>
                </label>

                <label className="checkbox-field">
                    <input checked={emergency}
                           onChange={(event) => setEmergency(event.target.checked)}
                           type="checkbox"/>
                    <span className={emergency ? "is-emergency" : ""}><Icon name="emergency"/> Emergência crítica</span>
                </label>
            </div>

            <label>Sintomas / Queixa principal
                <textarea rows={3} placeholder="Descreva os sintomas relatados pelo paciente..."/>
            </label>

            <div className="modal__actions">
                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Salvar Registro</Button>
            </div>
        </Modal>
    );
}
