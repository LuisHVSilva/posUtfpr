import {inject, injectable} from "tsyringe";
import {DateUtil} from "@shared/utils/date.util";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {QueueEntry} from "@features/entities/queueEntry";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {QueueAttendancePersistence} from "@features/persistences/queueAttendence.persistence";

@injectable()
export class QueueAttendanceService {
    private static readonly DEFAULT_MAX_ACTIVE_CALLS = 5;

    constructor(
        @inject("QueueAttendancePersistence")
        private readonly queueAttendancePersistence: QueueAttendancePersistence,
    ) {
    }

    async enqueue(attendance: PatientAttendances): Promise<QueueEntry> {
        const queueType = attendance.priority ? "TREATMENT" : "TRIAGE";
        const today = DateUtil.today();
        const queues = await this.queueAttendancePersistence.findAll();

        let queue = queues.find((currentQueue) =>
            currentQueue.type === queueType &&
            currentQueue.date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10),
        );

        if (!queue) {
            queue = QueueAttendance.create(
                today,
                queueType,
                QueueAttendanceService.DEFAULT_MAX_ACTIVE_CALLS,
            );
            queue = await this.queueAttendancePersistence.save(queue);
        }

        const updatedQueue = queue.addNewEntry(
            attendance.id!,
            attendance.patientId,
            attendance.priority,
            attendance.arrivalAt,
        );

        const persistedQueue = queue.id === undefined
            ? await this.queueAttendancePersistence.save(updatedQueue)
            : await this.queueAttendancePersistence.update(updatedQueue);

        return persistedQueue.waiting.find((entry) =>
            entry.attendanceId === attendance.id,
        )!;
    }
}
