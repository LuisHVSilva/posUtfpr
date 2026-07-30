import {injectable} from "tsyringe";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {PersistenceBase} from "@shared/base/persistence.base";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {Doctor} from "@features/entities/doctor";
import {DoctorStatusVo} from "@shared/valueObjects/doctorStatus.vo";

interface DoctorRecord {
    id: number;
    name: string;
    cpf: string;
    roomId?: number;
    status: string;
}

@injectable()
export class DoctorsPersistence implements PersistenceBase<Doctor, DoctorRecord> {
    private readonly store: JsonFileStore<DoctorRecord>;

    constructor(filePath = join(process.cwd(), "data", "doctors.json")) {
        this.store = new JsonFileStore<DoctorRecord>(filePath);
    }

    async save(doctor: Doctor): Promise<Doctor> {
        const records = this.store.readAll();
        const savedDoctor = Doctor.rehydrate({
            ...doctor.getProps(),
            id: this.store.nextId(records),
        });

        records.push(this.toRecord(savedDoctor));
        this.store.replaceAll(records);
        return savedDoctor;
    }

    async findByPk(id: number): Promise<Doctor | null> {
        const record = this.store.readAll().find((doctor) => doctor.id === id);
        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<Doctor[]> {
        return this.store.readAll().map((record) => this.toEntity(record));
    }

    async update(doctor: Doctor): Promise<Doctor> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === doctor.id);
        const updatedRecord = this.toRecord(doctor);

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

    toRecord(doctor: Doctor): DoctorRecord {
        return {
            id: doctor.id!,
            name: doctor.name,
            cpf: doctor.cpf.toString(),
            roomId: doctor.roomId,
            status: doctor.status.toString(),
        };
    }

    private toEntity(record: DoctorRecord): Doctor {
        return Doctor.rehydrate({
            id: record.id,
            name: record.name,
            cpf: CpfVo.createCpf(record.cpf),
            roomId: record.roomId,
            status: DoctorStatusVo.fromPersistence(record.status),
        });
    }
}
