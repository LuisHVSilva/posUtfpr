import {Button} from "../../../shared/components/Button/Button";
import {Modal} from "../../../shared/components/Modal/Modal";
// import {Icon} from "../../../shared/components/Icon/Icon";
import {toastService} from "../../../shared/services/toast.service.ts";

type Props = {
    attendanceId: number;
    open: boolean;
    onClose: () => void
}

export function RegisterTriageModa({attendanceId, open, onClose}: Props) {
    const handleSubmit = async (formData: FormData) => {
        try {
            // const payload: FinishTriageRequest = {
            //     attendanceId: attendanceId,
            //     triage: formUtil.getFormValue()
            // }
            //
            // await queueService.registerAttendance(payload);
            onClose();
        } catch (e) {
            if (e instanceof Error && e.message !== undefined) {
                toastService.error(e.message);
                return;
            }

            toastService.error('Erro no cadastro de atendimento');
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Registrar Novo Atendimento" action={handleSubmit}>

            <div className="form-grid__area">
                <label>Sintomas / Queixa principal</label>
                <textarea rows={3} placeholder="Descreva os sintomas relatados pelo paciente..." name={'symptoms'}/>
            </div>

            <div className="modal__actions">
                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Salvar Registro</Button>
            </div>
        </Modal>
    );
}
