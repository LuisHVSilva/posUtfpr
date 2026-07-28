import {injectable} from "tsyringe";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {PersistenceBase} from "@shared/base/persistence.base";
import {DateUtil} from "@shared/utils/date.util";
import {
    ActiveQueueEntry,
    ActiveQueueType,
} from "@features/entities/activeQueueEntry";

interface ActiveQueueEntryRecord {
    id: number;
    attendanceId: number;
    patientId: number;
    callNumber: number;
    doctorId: number;
    queueType: ActiveQueueType;
    startedAt: string;
}

@injectable()
export class ActiveQueueEntryPersistence
    implements PersistenceBase<ActiveQueueEntry, ActiveQueueEntryRecord> {
    private readonly store: JsonFileStore<ActiveQueueEntryRecord>;

    constructor(filePath = join(process.cwd(), "data", "activeQueueEntries.json")) {
        this.store = new JsonFileStore<ActiveQueueEntryRecord>(filePath);
    }

    async save(entry: ActiveQueueEntry): Promise<ActiveQueueEntry> {
        const records = this.store.readAll();
        const savedEntry = new ActiveQueueEntry({
            ...entry.getProps(),
            id: this.store.nextId(records),
        });

        records.push(this.toRecord(savedEntry));
        this.store.replaceAll(records);

        return savedEntry;
    }

    async findByPk(id: number): Promise<ActiveQueueEntry | null> {
        const record = this.store.readAll().find((entry) => entry.id === id);

        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<ActiveQueueEntry[]> {
        return this.store.readAll().map((record) => this.toEntity(record));
    }

    async update(entry: ActiveQueueEntry): Promise<ActiveQueueEntry> {
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

    private toEntity(record: ActiveQueueEntryRecord): ActiveQueueEntry {
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

    toRecord(entry: ActiveQueueEntry): ActiveQueueEntryRecord {
        return {
            id: entry.id as number,
            attendanceId: entry.attendanceId,
            patientId: entry.patientId,
            callNumber: entry.callNumber,
            doctorId: entry.doctorId,
            queueType: entry.queueType,
            startedAt: entry.startedAt.toISOString(),
        };
    }
}
