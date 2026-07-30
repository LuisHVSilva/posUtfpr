import {injectable} from "tsyringe";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {PersistenceBase} from "@shared/base/persistence.base";
import {DateUtil} from "@shared/utils/date.util";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {ActiveQueueEntry} from "@features/entities/activeQueueEntry";
import {QueueEntry} from "@features/entities/queueEntry";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";

interface QueueEntryRecord {
    id?: number;
    attendanceId: number;
    patientId: number;
    callNumber: number;
    queueType: QueueEntryTypeVo;
    priority?: string;
    enteredAt: string;
}

interface ActiveQueueEntryRecord {
    id?: number;
    attendanceId: number;
    patientId: number;
    callNumber: number;
    doctorId: number;
    queueType: QueueEntryTypeVo;
    startedAt: string;
}

interface QueueAttendanceRecord {
    id: number;
    date: string;
    type: QueueEntryTypeVo;
    nextCallNumber: number;
    waiting: QueueEntryRecord[];
    active: ActiveQueueEntryRecord[];
    maxActiveCalls: number;
    updatedAt: string;
}

@injectable()
export class QueueAttendancePersistence
    implements PersistenceBase<QueueAttendance, QueueAttendanceRecord> {
    private readonly store: JsonFileStore<QueueAttendanceRecord>;

    constructor(filePath = join(process.cwd(), "data", "queueAttendances.json")) {
        this.store = new JsonFileStore<QueueAttendanceRecord>(filePath);
    }

    async save(queue: QueueAttendance): Promise<QueueAttendance> {
        const records: QueueAttendanceRecord[] = this.store.readAll();
        const savedQueue = new QueueAttendance({
            ...queue.getProps(),
            id: this.store.nextId(records),
        });

        records.push(this.toRecord(savedQueue));
        this.store.replaceAll(records);

        return savedQueue;
    }

    async findByPk(id: number): Promise<QueueAttendance | null> {
        const record: QueueAttendanceRecord | undefined = this.store
            .readAll()
            .find((queue) => queue.id === id);

        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<QueueAttendance[]> {
        return this.store.readAll().map((record) => this.toEntity(record));
    }

    async findByAttendanceId(attendanceId: number): Promise<QueueAttendance | null> {
        const record: QueueAttendanceRecord | undefined = this.store
            .readAll()
            .find((queue) =>
                queue.waiting.some((entry) => entry.attendanceId === attendanceId) ||
                queue.active.some((entry) => entry.attendanceId === attendanceId),
            );

        return record ? this.toEntity(record) : null;
    }

    async update(queue: QueueAttendance): Promise<QueueAttendance> {
        const records: QueueAttendanceRecord[] = this.store.readAll();
        const index: number = records.findIndex((record) => record.id === queue.id);
        const updatedRecord: QueueAttendanceRecord = this.toRecord(queue);

        records[index] = updatedRecord;
        this.store.replaceAll(records);

        return this.toEntity(updatedRecord);
    }

    async deleteByPk(id: number): Promise<void> {
        const records: QueueAttendanceRecord[] = this.store.readAll();
        const index: number = records.findIndex((record) => record.id === id);

        records.splice(index, 1);
        this.store.replaceAll(records);
    }

    private toEntity(record: QueueAttendanceRecord): QueueAttendance {
        return QueueAttendance.rehydrate({
            id: record.id,
            date: DateUtil.parse(record.date),
            type: record.type,
            nextCallNumber: record.nextCallNumber,
            waiting: record.waiting.map((entry) => this.toQueueEntry(entry)),
            active: record.active.map((entry) => this.toActiveEntry(entry)),
            maxActiveCalls: record.maxActiveCalls,
            updatedAt: DateUtil.parse(record.updatedAt),
        });
    }

    private toQueueEntry(record: QueueEntryRecord): QueueEntry {
        return QueueEntry.rehydrate({
            id: record.id,
            attendanceId: record.attendanceId,
            patientId: record.patientId,
            callNumber: record.callNumber,
            queueType: record.queueType,
            priority: record.priority
                ? PriorityVo.fromPersistence(record.priority)
                : undefined,
            enteredAt: DateUtil.parse(record.enteredAt),
        });
    }

    private toActiveEntry(record: ActiveQueueEntryRecord): ActiveQueueEntry {
        return ActiveQueueEntry.rehydrate({
            id: record.id,
            attendanceId: record.attendanceId,
            patientId: record.patientId,
            callNumber: record.callNumber,
            doctorId: record.doctorId,
            queueType: record.queueType,
            startedAt: DateUtil.parse(record.startedAt),
        });
    }

    toRecord(queue: QueueAttendance): QueueAttendanceRecord {
        return {
            id: queue.id as number,
            date: queue.date.toISOString(),
            type: queue.type,
            nextCallNumber: queue.nextCallNumber,
            waiting: queue.waiting.map((entry) => ({
                id: entry.id,
                attendanceId: entry.attendanceId,
                patientId: entry.patientId,
                callNumber: entry.callNumber,
                queueType: entry.queueType,
                priority: entry.priority?.toString(),
                enteredAt: entry.enteredAt.toISOString(),
            })),
            active: queue.active.map((entry) => ({
                id: entry.id,
                attendanceId: entry.attendanceId,
                patientId: entry.patientId,
                callNumber: entry.callNumber,
                doctorId: entry.doctorId,
                queueType: entry.queueType,
                startedAt: entry.startedAt.toISOString(),
            })),
            maxActiveCalls: queue.maxActiveCalls,
            updatedAt: queue.updatedAt.toISOString(),
        };
    }
}
