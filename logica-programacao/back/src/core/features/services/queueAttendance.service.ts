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
        const queueType: QueueEntryTypeVo = attendance.priority?.isEmergency()
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

        // Para a triagem, a chegada já pode disparar uma chamada automática.
        // Se todas as salas estiverem ocupadas, o paciente continua em waiting.
        if (queueType.isTriage()) {
            await this.callNextAvailable(QueueEntryTypeVo.TRIAGE);
        }

        return queueEntry;
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
        available: {room: Rooms; doctor: Doctor},
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

        if (attendance && type.isTriage()) {
            await this.patientAttendancesPersistence.update(attendance.startTriage());
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
}
