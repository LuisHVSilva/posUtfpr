import {injectable} from "tsyringe";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {join} from "node:path";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {PersistenceBase} from "@shared/base/persistence.base";
import {DateUtil} from "@shared/utils/date.util";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {StatusVo} from "@shared/valueObjects/status.vo";

interface PatientAttendancesRecord {
    id: number;
    patientId: number;
    symptoms: string;
    arrivalAt: string;
    priority?: string;
    status: string;
    triageStartedAt?: string;
    triageFinishedAt?: string;
    treatmentStartedAt?: string;
    treatmentFinishedAt?: string;
}

@injectable()
export class PatientAttendancesPersistence implements PersistenceBase<PatientAttendances, PatientAttendancesRecord> {
    private readonly store: JsonFileStore<PatientAttendancesRecord>;

    constructor(filePath = join(process.cwd(), "data", "patientRecordss.json")) {
        this.store = new JsonFileStore<PatientAttendancesRecord>(filePath);
    }

    async save(patientRecords: PatientAttendances): Promise<PatientAttendances> {
        const records = this.store.readAll();
        const savedPatient = new PatientAttendances({...patientRecords.getProps(), id: this.store.nextId(records)});

        records.push(this.toRecord(savedPatient));
        this.store.replaceAll(records);
        return savedPatient;
    }

    async findByPk(id: number): Promise<PatientAttendances | null> {
        const record: PatientAttendancesRecord | undefined = this.store.readAll().find((patientRecords) =>
            patientRecords.id === id);

        if (!record) {
            return null;
        }

        return this.toEntity(record);
    }

    async findAll(): Promise<PatientAttendances[]> {
        return this.store.readAll().map((record) => this.toEntity(record));
    }

    async update(patientRecords: PatientAttendances): Promise<PatientAttendances> {
        const records: PatientAttendancesRecord[] = this.store.readAll();
        const index: number = records.findIndex((record: PatientAttendancesRecord): boolean =>
            record.id === patientRecords.id);

        const updatedRecord: PatientAttendancesRecord = {
            id: patientRecords.id!,
            patientId: patientRecords.patientId,
            symptoms: patientRecords.symptoms,
            arrivalAt: patientRecords.arrivalAt.toISOString(),
            priority: patientRecords.priority?.toString(),
            status: patientRecords.status.toString(),
            triageStartedAt: patientRecords.triageStartedAt?.toISOString(),
            triageFinishedAt: patientRecords.triageFinishedAt?.toISOString(),
            treatmentStartedAt: patientRecords.treatmentStartedAt?.toISOString(),
            treatmentFinishedAt: patientRecords.treatmentFinishedAt?.toISOString()
        };

        records[index] = updatedRecord;
        this.store.replaceAll(records);

        return this.toEntity(updatedRecord);
    }

    async deleteByPk(pk: number): Promise<void> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === pk);

        records.splice(index, 1);
        this.store.replaceAll(records);
    }

    async findByPatientId(patientId: number): Promise<PatientAttendances[]> {
        return this.store
            .readAll()
            .filter((record) => record.patientId === patientId)
            .map((record) => this.toEntity(record));
    }

    private toEntity(record: PatientAttendancesRecord): PatientAttendances {
        return PatientAttendances.rehydrate({
            id: record.id,
            patientId: record.patientId,
            symptoms: record.symptoms,
            arrivalAt: DateUtil.parse(record.arrivalAt),
            priority: record.priority
                ? PriorityVo.fromPersistence(record.priority)
                : undefined,
            status: StatusVo.fromPersistence(record.status),
            triageStartedAt: record.triageStartedAt
                ? DateUtil.parse(record.triageStartedAt)
                : undefined,
            triageFinishedAt: record.triageFinishedAt
                ? DateUtil.parse(record.triageFinishedAt)
                : undefined,
            treatmentStartedAt: record.treatmentStartedAt
                ? DateUtil.parse(record.treatmentStartedAt)
                : undefined,
            treatmentFinishedAt: record.treatmentFinishedAt
                ? DateUtil.parse(record.treatmentFinishedAt)
                : undefined,
        });
    }

    toRecord(patientRecords: PatientAttendances): PatientAttendancesRecord {
        return {
            id: patientRecords.id!,
            patientId: patientRecords.patientId,
            symptoms: patientRecords.symptoms,
            arrivalAt: patientRecords.arrivalAt.toISOString(),
            priority: patientRecords.priority?.toString(),
            status: patientRecords.status.toString(),
            triageStartedAt: patientRecords.triageStartedAt?.toISOString(),
            triageFinishedAt: patientRecords.triageFinishedAt?.toISOString(),
            treatmentStartedAt: patientRecords.treatmentStartedAt?.toISOString(),
            treatmentFinishedAt: patientRecords.treatmentFinishedAt?.toISOString()
        };
    }
}
