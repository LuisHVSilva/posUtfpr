import {Button} from "../../../shared/components/Button/Button";
import {Modal} from "../../../shared/components/Modal/Modal";
import {toastService} from "../../../shared/services/toast.service.ts";
import {usePriorityDashboardList} from "../hooks/useDashboardData.ts";
import type {TriageType} from "../../../shared/types/metadata.type.ts";
import {useMemo, useState} from "react";
import {queueService} from "../../../shared/services/queue.service.ts";
import {queryClient} from "../../../shared/services/queryClient.service.ts";

type Props = {
    roomId: number | null;
    open: boolean;
    onClose: () => void
}

export function RegisterTriageModal({roomId, open, onClose}: Props) {

    const {data: prioritiesList} = usePriorityDashboardList();
    const triageOptions: TriageType[] = useMemo(() => prioritiesList ?? [], [prioritiesList]);
    const [priority, setPriority] = useState<string>('');

    const handleSubmit = async (formData: FormData) => {
        const selectedPriority = String(formData.get('priority') ?? '');

        if (roomId === null) {
            toastService.error('Sala não selecionada');
            return;
        }

        if (selectedPriority === '') {
            toastService.error('Triagem não pode estar vazio');
            return;
        }

        try {
            await queueService.finishTriage({
                roomId: roomId,
                priority: selectedPriority
            })
            await queryClient.invalidateQueries({queryKey: ["dashboardData"]});
            onClose();
            toastService.success('Atendimento finalizado com sucesso.')
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
                <label htmlFor="priority">Prioridade *</label>
                <select
                    id="priority"
                    value={priority ?? ""}
                    name={"priority"}
                    required
                    onChange={(e) => setPriority(e.currentTarget.value)}
                >
                    <option value="" disabled>Selecione a prioridade</option>
                    {triageOptions.map((triage) => (
                        <option key={triage.key} value={triage.key}>{triage.label}</option>
                    ))}
                </select>
            </div>

            <div className="modal__actions">
                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Salvar Registro</Button>
            </div>
        </Modal>
    );
}
