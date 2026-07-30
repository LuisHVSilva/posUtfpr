import {injectable} from "tsyringe";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {PersistenceBase} from "@shared/base/persistence.base";
import {DateUtil} from "@shared/utils/date.util";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {QueueEntry,} from "@features/entities/queueEntry";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";

interface QueueEntryRecord {
    id: number;
    attendanceId: number;
    patientId: number;
    callNumber: number;
    queueType: QueueEntryTypeVo;
    priority?: string;
    enteredAt: string;
}

@injectable()
export class QueueEntryPersistence
    implements PersistenceBase<QueueEntry, QueueEntryRecord> {
    private readonly store: JsonFileStore<QueueEntryRecord>;

    constructor(filePath = join(process.cwd(), "data", "queueEntries.json")) {
        this.store = new JsonFileStore<QueueEntryRecord>(filePath);
    }

    async save(entry: QueueEntry): Promise<QueueEntry> {
        const records = this.store.readAll();
        const savedEntry = new QueueEntry({
            ...entry.getProps(),
            id: this.store.nextId(records),
        });

        records.push(this.toRecord(savedEntry));
        this.store.replaceAll(records);

        return savedEntry;
    }

    async findByPk(id: number): Promise<QueueEntry | null> {
        const record = this.store.readAll().find((entry) => entry.id === id);

        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<QueueEntry[]> {
        return this.store.readAll().map((record) => this.toEntity(record));
    }

    async update(entry: QueueEntry): Promise<QueueEntry> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === entry.id);
        const updatedRecord = this.toRecord(entry);

        records[index] = updatedRecord;
        this.store.replaceAll(records);

        return this.toEntity(updatedRecord);
    }

    async deleteByPk(id: number): Promise<void> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === id);

        records.splice(index, 1);
        this.store.replaceAll(records);
    }

    private toEntity(record: QueueEntryRecord): QueueEntry {
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

    toRecord(entry: QueueEntry): QueueEntryRecord {
        return {
            id: entry.id as number,
            attendanceId: entry.attendanceId,
            patientId: entry.patientId,
            callNumber: entry.callNumber,
            queueType: entry.queueType,
            priority: entry.priority?.toString(),
            enteredAt: entry.enteredAt.toISOString(),
        };
    }
}
