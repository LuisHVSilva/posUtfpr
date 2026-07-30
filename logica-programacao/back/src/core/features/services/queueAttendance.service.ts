import {inject, injectable} from "tsyringe";
import {DateUtil} from "@shared/utils/date.util";
import {BusinessRuleError, NotFoundError} from "@shared/errors/application.error";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {QueueEntry} from "@features/entities/queueEntry";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {ActiveQueueEntry} from "@features/entities/activeQueueEntry";
import {Rooms} from "@features/entities/rooms";
import {Doctor} from "@features/entities/doctor";
import {QueueAttendancePersistence} from "@features/persistences/queueAttendence.persistence";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {RoomsService} from "@features/services/rooms.service";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";

type CallsPanelItem = {
    code: string;
    room: string;
};

type CallsPanel = {
    title: string;
    currentCode: string;
    currentRoom: string;
    tone: "triage" | "attendance";
    history: CallsPanelItem[];
};

type CallsDisplay = {
    alert: string;
    systemStatus: string;
    panels: CallsPanel[];
    stats: Array<{
        label: string;
        value: string;
        tone: "emergency" | "urgent" | "stable";
    }>;
};

@injectable()
export class QueueAttendanceService {
    private static readonly DEFAULT_MAX_ACTIVE_CALLS = 5;

    constructor(
        @inject("QueueAttendancePersistence")
        private readonly queueAttendancePersistence: QueueAttendancePersistence,
        @inject("PatientAttendancesPersistence")
        private readonly patientAttendancesPersistence: PatientAttendancesPersistence,
        @inject("RoomsService")
        private readonly roomsService: RoomsService,
    ) {
    }

    async enqueue(attendance: PatientAttendances): Promise<QueueEntry> {
        const queueType: QueueEntryTypeVo = attendance.priority?.isEmergency() || attendance.triageFinishedAt
            ? QueueEntryTypeVo.TREATMENT
            : QueueEntryTypeVo.TRIAGE;
        const today = DateUtil.today();
        const queues = await this.queueAttendancePersistence.findAll();

        let queue = queues.find((currentQueue) =>
            currentQueue.type.toString() === queueType.toString() &&
            currentQueue.date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10),
        );

        if (!queue) {
            queue = await this.queueAttendancePersistence.save(
                QueueAttendance.create(
                    today,
                    queueType,
                    QueueAttendanceService.DEFAULT_MAX_ACTIVE_CALLS,
                ),
            );
        }

        const updatedQueue = queue.addNewEntry(
            attendance.id!,
            attendance.patientId,
            attendance.priority,
            attendance.arrivalAt,
        );
        const persistedQueue = await this.queueAttendancePersistence.update(updatedQueue);
        const queueEntry = persistedQueue.waiting.find((entry) =>
            entry.attendanceId === attendance.id,
        )!;

        // A chegada em qualquer fila tenta ocupar salas livres imediatamente.
        // Sem sala disponível, a entrada permanece aguardando.
        await this.callNextAvailable(queueType);

        return queueEntry;
    }

    /** Retorna os indicadores das filas do dia corrente. */
    async getSummary(): Promise<{
        waitingPatients: number;
        emergencies: number;
    }> {
        const today = DateUtil.today().toISOString().slice(0, 10);
        const queues = (await this.queueAttendancePersistence.findAll()).filter((queue) =>
            queue.date.toISOString().slice(0, 10) === today,
        );

        const waitingPatients = queues.reduce(
            (total, queue) => total + queue.waiting.length,
            0,
        );

        const treatmentEntries = queues
            .filter((queue) => queue.type.isTreatment())
            .flatMap((queue) => queue.active);

        const attendances = await Promise.all(
            treatmentEntries.map((entry) =>
                this.patientAttendancesPersistence.findByPk(entry.attendanceId),
            ),
        );

        const emergencies = attendances.filter((attendance) =>
            attendance?.priority?.isEmergency(),
        ).length;

        return {waitingPatients, emergencies};
    }

    async getActiveEntries(): Promise<ActiveQueueEntry[]> {
        const today = DateUtil.today().toISOString().slice(0, 10);
        const queues = (await this.queueAttendancePersistence.findAll()).filter((queue) =>
            queue.date.toISOString().slice(0, 10) === today,
        );

        return queues.flatMap((queue) => queue.active);
    }

    async getCallsDisplay(): Promise<CallsDisplay> {
        const today = DateUtil.today().toISOString().slice(0, 10);
        const queues = (await this.queueAttendancePersistence.findAll()).filter((queue) =>
            queue.date.toISOString().slice(0, 10) === today,
        );
        const triageQueue = queues.find((queue) => queue.type.isTriage());
        const treatmentQueue = queues.find((queue) => queue.type.isTreatment());
        const treatmentActiveAttendances = await Promise.all(
            (treatmentQueue?.active ?? []).map((entry) =>
                this.patientAttendancesPersistence.findByPk(entry.attendanceId),
            ),
        );
        const hasEmergencyActive = treatmentActiveAttendances.some((attendance) =>
            attendance?.priority?.isEmergency(),
        );

        return {
            alert: hasEmergencyActive
                ? "Atencao: prioridade maxima em atendimento"
                : "Painel de chamadas atualizado",
            systemStatus: "Sistema Ativo",
            panels: [
                await this.buildCallsPanel("Triagem", "triage", triageQueue?.active ?? []),
                await this.buildCallsPanel("Atendimento", "attendance", treatmentQueue?.active ?? []),
            ],
            stats: this.buildWaitingStats(queues),
        };
    }

    private async buildCallsPanel(
        title: string,
        tone: "triage" | "attendance",
        entries: ActiveQueueEntry[],
    ): Promise<CallsPanel> {
        const orderedEntries = [...entries].sort((first, second) =>
            second.startedAt.getTime() - first.startedAt.getTime(),
        );
        const panelItems = await Promise.all(
            orderedEntries.map((entry) => this.toCallsPanelItem(entry)),
        );
        const current = panelItems[0];

        return {
            title,
            tone,
            currentCode: current?.code ?? "--",
            currentRoom: current?.room ?? "Sem chamada ativa",
            history: panelItems.slice(1, 4),
        };
    }

    private async toCallsPanelItem(entry: ActiveQueueEntry): Promise<CallsPanelItem> {
        let roomName = "Sala nao localizada";

        try {
            const {room} = await this.roomsService.findByDoctorId(entry.doctorId);
            roomName = room.name;
        } catch (_error) {
            roomName = "Sala indisponivel";
        }

        return {
            code: this.formatTicket(entry.queueType.isTreatment(), entry.callNumber),
            room: roomName,
        };
    }

    private buildWaitingStats(queues: QueueAttendance[]): CallsDisplay["stats"] {
        const waitingEntries = queues.flatMap((queue) => queue.waiting);
        const emergency = waitingEntries.filter((entry) =>
            entry.priority?.isEmergency(),
        ).length;
        const urgent = waitingEntries.filter((entry) => {
            const priority = entry.priority?.toString();

            return priority === PriorityVo.VERY_URGENT.toString() ||
                priority === PriorityVo.URGENT.toString();
        }).length;
        const stable = waitingEntries.length - emergency - urgent;

        return [
            {label: "Emergencia", value: `${String(emergency).padStart(2, "0")} Aguardando`, tone: "emergency"},
            {label: "Muito Urgente", value: `${String(urgent).padStart(2, "0")} Aguardando`, tone: "urgent"},
            {label: "Pouco Urgente", value: `${String(stable).padStart(2, "0")} Aguardando`, tone: "stable"},
        ];
    }

    private formatTicket(isTreatment: boolean, callNumber: number): string {
        return `${isTreatment ? "A" : "T"}-${String(callNumber).padStart(3, "0")}`;
    }

    async findActiveTriageEntryByRoomId(roomId: number): Promise<ActiveQueueEntry> {
        const {room, doctor} = await this.roomsService.findByRoomId(roomId);

        if (room.type.toString() !== RoomTypeVo.TRIAGE.toString()) {
            throw new BusinessRuleError("Room is not a triage room.");
        }

        const queue = (await this.queueAttendancePersistence.findAll()).find((currentQueue) =>
            currentQueue.type.isTriage()
        );

        const activeEntry = queue?.active.find((entry) =>
            entry.doctorId === doctor.id,
        );

        if (!activeEntry) {
            throw new BusinessRuleError(`Room ${roomId} does not have an active triage attendance.`);
        }

        return activeEntry;
    }

    async findActiveTreatmentEntryByRoomId(roomId: number): Promise<ActiveQueueEntry> {
        const {room, doctor} = await this.roomsService.findByRoomId(roomId);

        if (room.type.toString() !== RoomTypeVo.TREATMENT.toString()) {
            throw new BusinessRuleError("Room is not a treatment room.");
        }

        const queue = (await this.queueAttendancePersistence.findAll()).find((currentQueue) =>
            currentQueue.type.isTreatment()
        );

        const activeEntry = queue?.active.find((entry) =>
            entry.doctorId === doctor.id,
        );

        if (!activeEntry) {
            throw new BusinessRuleError(`Room ${roomId} does not have an active treatment attendance.`);
        }

        return activeEntry;
    }

    /**
     * Tenta preencher todas as salas ativas e vazias de um determinado tipo.
     */
    async callNextAvailable(type: QueueEntryTypeVo): Promise<ActiveQueueEntry[]> {
        const calledPatients: ActiveQueueEntry[] = [];
        const roomType = type.isTriage() ? RoomTypeVo.TRIAGE : RoomTypeVo.TREATMENT;
        const availableRooms = await this.roomsService.findAvailable(roomType);

        for (const available of availableRooms) {
            const calledPatient = await this.callNextInRoom(type, available);

            if (calledPatient) {
                calledPatients.push(calledPatient);
            }
        }

        return calledPatients;
    }

    /** Chama o primeiro paciente da fila na sala já selecionada. */
    private async callNextInRoom(
        type: QueueEntryTypeVo,
        available: { room: Rooms; doctor: Doctor },
    ): Promise<ActiveQueueEntry | null> {
        const today = DateUtil.today();
        const queue = (await this.queueAttendancePersistence.findAll()).find((currentQueue) =>
            currentQueue.type.toString() === type.toString() &&
            currentQueue.date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10),
        );

        if (!queue || queue.waiting.length === 0) {
            return null;
        }

        // QueueAttendance é quem aplica a ordem da fila. Para TRIAGE, a
        // ordem é chegada e número; para TREATMENT, será usado o peso.
        const updatedQueue = queue.callNext(available.doctor.id!);
        const persistedQueue = await this.queueAttendancePersistence.update(updatedQueue);
        const activeEntry = persistedQueue.active.find((entry) =>
            entry.doctorId === available.doctor.id &&
            entry.queueType.toString() === type.toString(),
        );

        if (!activeEntry) {
            return null;
        }

        await this.roomsService.populate(available.room);

        const attendance = await this.patientAttendancesPersistence.findByPk(
            activeEntry.attendanceId,
        );

        if (attendance) {
            await this.patientAttendancesPersistence.update(
                type.isTriage()
                    ? attendance.startTriage()
                    : attendance.startTreatment(),
            );
        }

        return activeEntry;
    }

    /**
     * Finaliza a triagem atual, libera a sala do médico e chama o próximo
     * paciente na mesma sala, se houver alguém aguardando.
     */
    async finalizeTriage(attendanceId: number): Promise<ActiveQueueEntry | null> {
        const queue = await this.queueAttendancePersistence.findByAttendanceId(attendanceId);

        if (!queue) {
            throw new NotFoundError(`Cannot find attendance ${attendanceId}.`);
        }

        if (!queue.type.isTriage()) {
            throw new BusinessRuleError(`Attendance ${attendanceId} is not in triage.`);
        }

        const currentEntry = queue.active.find((entry) =>
            entry.attendanceId === attendanceId,
        );

        if (!currentEntry) {
            throw new BusinessRuleError(`Attendance ${attendanceId} is not active in triage.`);
        }

        // O ActiveQueueEntry informa o médico; Doctor.roomId informa a sala.
        const {room, doctor} = await this.roomsService.findByDoctorId(
            currentEntry.doctorId,
        );

        if (room.type.toString() !== RoomTypeVo.TRIAGE.toString()) {
            throw new BusinessRuleError("Attendance is not in a triage room.");
        }

        // Primeiro a entrada atual sai da lista active.
        const queueWithoutCurrent = queue.finish(attendanceId);
        await this.queueAttendancePersistence.update(queueWithoutCurrent);

        // A sala fica disponível antes da busca do próximo paciente.
        await this.roomsService.clear(room);

        // A sala liberada é a primeira candidata para a próxima chamada.
        return this.callNextInRoom(
            QueueEntryTypeVo.TRIAGE,
            {room: room.clear(), doctor},
        );
    }

    /**
     * Finaliza o atendimento atual, libera a sala e chama o prÃ³ximo paciente
     * da fila de atendimento usando a ordenaÃ§Ã£o por peso de prioridade.
     */
    async finalizeAttendance(attendanceId: number): Promise<ActiveQueueEntry | null> {
        const queue = await this.queueAttendancePersistence.findByAttendanceId(attendanceId);

        if (!queue) {
            throw new NotFoundError(`Cannot find attendance ${attendanceId}.`);
        }

        if (!queue.type.isTreatment()) {
            throw new BusinessRuleError(`Attendance ${attendanceId} is not in treatment.`);
        }

        const currentEntry = queue.active.find((entry) =>
            entry.attendanceId === attendanceId,
        );

        if (!currentEntry) {
            throw new BusinessRuleError(`Attendance ${attendanceId} is not active in treatment.`);
        }

        const {room, doctor} = await this.roomsService.findByDoctorId(
            currentEntry.doctorId,
        );

        if (room.type.toString() !== RoomTypeVo.TREATMENT.toString()) {
            throw new BusinessRuleError("Attendance is not in a treatment room.");
        }

        const queueWithoutCurrent = queue.finish(attendanceId);
        await this.queueAttendancePersistence.update(queueWithoutCurrent);
        await this.roomsService.clear(room);

        return this.callNextInRoom(
            QueueEntryTypeVo.TREATMENT,
            {room: room.clear(), doctor},
        );
    }
}
