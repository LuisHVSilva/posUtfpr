import {useState} from "react";
import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import {AdminLayout} from "../../../layouts/AdminLayout/AdminLayout";
import {useDashboardData} from "../hooks/useDashboardData";
import {RegisterAttendanceModal} from "../components/RegisterAttendanceModal";
import {RoomGrid} from "../components/RoomGrid";
import {SummaryCard} from "../components/SummaryCard";
import "../styles/dashboard.scss";
import {RegisterTriageModal} from "../components/RegisterTriageModal.tsx";
import type {Room} from "../types/dashboard.types.ts";
import {queueService} from "../../../shared/services/queue.service.ts";
import {toastService} from "../../../shared/services/toast.service.ts";
import {queryClient} from "../../../shared/services/queryClient.service.ts";

export function DashboardPage() {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [finishAttendanceModal, setFinishAttendanceModal] = useState<boolean>(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const {data: dashboardData} = useDashboardData();

    if (!dashboardData) {
        return <h1>Erro de dado</h1>
    }

    const {rooms, ...summary} = dashboardData;

    const handleStartFinishAttendance = async (room: Room) => {
        if (room.queueType === "TRIAGE") {
            setSelectedRoomId(room.id);
            setFinishAttendanceModal(true);
            return;
        }

        try {
            await queueService.finishAttendance({roomId: room.id});
            await queryClient.invalidateQueries({queryKey: ["dashboardData"]});
            toastService.success('Atendimento finalizado com sucesso.');
        } catch (e) {
            if (e instanceof Error && e.message !== undefined) {
                toastService.error(e.message);
                return;
            }

            toastService.error('Erro ao finalizar atendimento');
        }
    };

    const handleCloseFinishAttendance = () => {
        setFinishAttendanceModal(false);
        setSelectedRoomId(null);
    };

    const handleAttendanceSaved = async () => {
        await queryClient.invalidateQueries({queryKey: ["dashboardData"]});
    };

    return (
        <AdminLayout activePath="/dashboard">
            <div className="dashboard-page">
                <header className="dashboard-page__header">
                    <div>
                        <h1>Monitoramento de Salas</h1>
                        <p>Acompanhamento em tempo real das unidades de atendimento.</p>
                    </div>
                    <Button icon={<Icon name="add"/>} onClick={() => setModalOpen(true)}>Registrar Atendimento</Button>
                </header>
                <section className="summary-grid" aria-label="Resumo da operação">
                    <SummaryCard label="Salas ativas" value={summary.activeRooms}/>
                    <SummaryCard label="Aguardando" value={summary.waitingPatients} tone="secondary"/>
                    <SummaryCard label="Média de espera" value={summary.averageWait} tone="neutral"/>
                    <SummaryCard
                        label="Emergências"
                        value={String(summary.emergencies).padStart(2, "0")}
                        tone="danger"
                    />
                </section>
                <RoomGrid
                    rooms={rooms}
                    onStartFinishAttendance={handleStartFinishAttendance}
                />
            </div>

            <button
                className="dashboard-page__mobile-action"
                aria-label="Registrar atendimento"
                onClick={() => setModalOpen(true)}>
                <Icon name="add" size="1.8rem"/>
            </button>
            <RegisterAttendanceModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleAttendanceSaved}
            />
            <RegisterTriageModal
                roomId={selectedRoomId}
                open={finishAttendanceModal}
                onClose={handleCloseFinishAttendance}
            />
        </AdminLayout>
    )
}
