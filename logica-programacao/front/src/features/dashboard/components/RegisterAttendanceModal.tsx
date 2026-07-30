import {useEffect, useState} from "react";
import {Button} from "../../../shared/components/Button/Button";
import {Modal} from "../../../shared/components/Modal/Modal";
import {Icon} from "../../../shared/components/Icon/Icon";
import type {PatientLookupResult, RegisterQueueRequest} from "../../../shared/types/queue.type.ts";
import {formUtil} from "../../../shared/utils/form.util.ts";
import {toastService} from "../../../shared/services/toast.service.ts";
import {queueService} from "../../../shared/services/queue.service.ts";

type RegisterAttendanceModalProps = {
    open: boolean;
    onClose: () => void;
    onSaved: () => Promise<void>;
};

type LookupStatus = "idle" | "searching" | "found" | "not-found";

export function RegisterAttendanceModal({open, onClose, onSaved}: RegisterAttendanceModalProps) {
    const [emergency, setEmergency] = useState(false);
    const [cpf, setCpf] = useState("");
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [patient, setPatient] = useState<PatientLookupResult | null>(null);
    const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
    const cpfDigits = cpf.replace(/\D/g, "");
    const canFillPatientFields = cpfDigits.length === 11 && lookupStatus === "not-found";
    const patientFieldsDisabled = patient !== null || !canFillPatientFields;

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setEmergency(false);
        setCpf("");
        setName("");
        setBirthday("");
        setPatient(null);
        setLookupStatus("idle");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const lookupPatient = async (value: string) => {
        const digits = value.replace(/\D/g, "");

        if (digits.length !== 11) {
            setPatient(null);
            setLookupStatus("idle");
            return;
        }

        setLookupStatus("searching");

        try {
            const foundPatient = await queueService.findPatientByCpf(digits);

            if (!foundPatient) {
                setPatient(null);
                setLookupStatus("not-found");
                return;
            }

            setPatient(foundPatient);
            setName(foundPatient.name);
            setBirthday(foundPatient.birthday.slice(0, 10));
            setLookupStatus("found");
        } catch (error) {
            setPatient(null);
            setLookupStatus("idle");

            if (error instanceof Error) {
                toastService.error(error.message);
                return;
            }

            toastService.error("Erro ao buscar paciente pelo CPF.");
        }
    };

    const handleCpfChange = (value: string) => {
        setCpf(value);

        if (patient !== null) {
            setName("");
            setBirthday("");
        }

        setPatient(null);

        if (value.replace(/\D/g, "").length < 11) {
            setLookupStatus("idle");
        }
    };

    const handleSubmit = async (formData: FormData) => {
        try {
            const payload: RegisterQueueRequest = {
                name: formUtil.getFormValue(formData, "name"),
                cpf: formUtil.getFormValue(formData, "cpf").replace(/\D/g, ""),
                birthday: formUtil.getFormValue(formData, "birthday"),
                symptoms: formUtil.getFormValue(formData, "symptoms"),
                isEmergency: formUtil.getFormValueFromCheckbox(formData, "isEmergency"),
            };

            await queueService.registerAttendance(payload);
            await onSaved();
            toastService.success("Atendimento registrado com sucesso.");
            handleClose();
        } catch (e) {
            if (e instanceof Error && e.message !== undefined) {
                toastService.error(e.message);
                return;
            }

            toastService.error("Erro no cadastro de atendimento");
        }
    };

    return (
        <Modal open={open} onClose={handleClose} title="Registrar Novo Atendimento" action={handleSubmit}>
            <div className="form-grid">
                <div className="form-grid__area">
                    <label>CPF</label>
                    <input
                        required
                        placeholder="000.000.000-00"
                        name="cpf"
                        value={cpf}
                        onBlur={() => lookupPatient(cpf)}
                        onChange={(event) => handleCpfChange(event.target.value)}
                    />
                    {lookupStatus === "searching" && <span className="form-grid__hint">Buscando paciente...</span>}
                    {/*{lookupStatus === "found" && <span className="form-grid__hint">Paciente encontrado.</span>}*/}
                    {lookupStatus === "not-found" && (
                        <span className="form-grid__hint">Paciente nao encontrado. Preencha o cadastro.</span>
                    )}
                </div>

                <div className="form-grid__area">
                    <label>Nome completo</label>
                    <input
                        required
                        placeholder="Nome do paciente"
                        name="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={patientFieldsDisabled}
                    />
                </div>

                <div className="form-grid__area">
                    <label>Data de nascimento</label>
                    <input
                        required
                        type="date"
                        name="birthday"
                        value={birthday}
                        onChange={(event) => setBirthday(event.target.value)}
                        disabled={patientFieldsDisabled}
                    />
                </div>

                <div className="form-grid__area-checkbox">
                    <label className="checkbox-field"></label>
                    <input
                        checked={emergency}
                        onChange={(event) => setEmergency(event.target.checked)}
                        name="isEmergency"
                        type="checkbox"
                    />
                    <span className={emergency ? "is-emergency" : ""}>
                        <Icon name="emergency"/> Emergencia critica
                    </span>
                </div>
            </div>

            <div className="form-grid__area">
                <label>Sintomas / Queixa principal</label>
                <textarea rows={3} placeholder="Descreva os sintomas relatados pelo paciente..." name="symptoms"/>
            </div>

            <div className="modal__actions">
                <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                <Button type="submit">Salvar Registro</Button>
            </div>
        </Modal>
    );
}
