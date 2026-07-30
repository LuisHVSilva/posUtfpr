import {useState} from "react";
import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import {AdminLayout} from "../../../layouts/AdminLayout/AdminLayout";
import {useDashboardData} from "../hooks/useDashboardData";
import {RegisterAttendanceModal} from "../components/RegisterAttendanceModal";
import {RoomGrid} from "../components/RoomGrid";
import {SummaryCard} from "../components/SummaryCard";
import "../styles/dashboard.scss";

export function DashboardPage() {
    const {summary, rooms} = useDashboardData();
    const [modalOpen, setModalOpen] = useState(false);
    const [finishedRooms, setFinishedRooms] = useState<number[]>([]);
    const visibleRooms = rooms.filter((room) => !finishedRooms.includes(room.id));
    const handleFinish = (roomId: number) => setFinishedRooms((current) => [...current, roomId]);
    return <AdminLayout activePath="/dashboard">
        <div className="dashboard-page">
            <header className="dashboard-page__header">
                <div><h1>Monitoramento de Salas</h1><p>Acompanhamento em tempo real das unidades de atendimento.</p>
                </div>
                <Button icon={<Icon name="add"/>} onClick={() => setModalOpen(true)}>Registrar Atendimento</Button>
            </header>
            <section className="summary-grid" aria-label="Resumo da operação"><SummaryCard label="Salas ativas"
                                                                                           value={summary.activeRooms}/><SummaryCard
                label="Aguardando" value={summary.waitingPatients} tone="secondary"/><SummaryCard
                label="Média de espera" value={summary.averageWait} tone="neutral"/><SummaryCard label="Emergências"
                                                                                                 value={String(summary.emergencies).padStart(2, "0")}
                                                                                                 tone="danger"/>
            </section>
            <RoomGrid rooms={visibleRooms} onFinish={handleFinish}/></div>
        <button className="dashboard-page__mobile-action" aria-label="Registrar atendimento"
                onClick={() => setModalOpen(true)}><Icon name="add" size="1.8rem"/></button>
        <RegisterAttendanceModal open={modalOpen} onClose={() => setModalOpen(false)}/></AdminLayout>;
}
