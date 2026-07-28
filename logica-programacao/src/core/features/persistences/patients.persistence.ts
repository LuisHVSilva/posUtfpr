import {injectable} from "tsyringe";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {join} from "node:path";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {PersistenceBase} from "@shared/base/persistence.base";
import {DateUtil} from "@shared/utils/date.util";
import {Patients} from "@features/entities/patients";

interface PatientRecord {
    id: number;
    name: string;
    birthday: string;
    cpf: string;
}

@injectable()
export class PatientsPersistence implements PersistenceBase<Patients, PatientRecord> {
    private readonly store: JsonFileStore<PatientRecord>;

    constructor(filePath = join(process.cwd(), "data", "patients.json")) {
        this.store = new JsonFileStore<PatientRecord>(filePath);
    }

    async save(patient: Patients): Promise<Patients> {
        const records = this.store.readAll();
        const savedPatient = new Patients({...patient.getProps(), id: this.store.nextId(records)});

        records.push(this.toRecord(savedPatient));
        this.store.replaceAll(records);
        return savedPatient;
    }

    async findByPk(id: number): Promise<Patients | null> {
        const record: PatientRecord | undefined = this.store.readAll().find((patient) =>
            patient.id === id);

        if (!record) {
            return null;
        }

        return Patients.rehydrate({
            id: record.id,
            name: record.name,
            birthday: DateUtil.parse(record.birthday),
            cpf: CpfVo.createCpf(record.cpf),
        });
    }

    async findAll(): Promise<Patients[]> {
        return this.store.readAll().map((record) => Patients.rehydrate({
            id: record.id,
            name: record.name,
            birthday: DateUtil.parse(record.birthday),
            cpf: CpfVo.createCpf(record.cpf),
        }));
    }

    async update(patient: Patients): Promise<Patients> {
        const records: PatientRecord[] = this.store.readAll();
        const index: number = records.findIndex((record: PatientRecord): boolean =>
            record.id === patient.id);

        const updatedRecord: PatientRecord = {
            id: patient.id!,
            name: patient.name,
            birthday: patient.birthday.toISOString(),
            cpf: patient.cpf.toString()
        };

        records[index] = updatedRecord;
        this.store.replaceAll(records);

        return Patients.rehydrate({
            id: updatedRecord.id,
            name: updatedRecord.name,
            birthday: DateUtil.parse(updatedRecord.birthday),
            cpf: CpfVo.createCpf(updatedRecord.cpf),
        });
    }

    async deleteByPk(pk: number): Promise<void> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === pk);

        records.splice(index, 1);
        this.store.replaceAll(records);
    }

    async existsByCpf(cpf: string): Promise<boolean> {
        const record: PatientRecord | undefined = this.store.readAll().find((patient) =>
            patient.cpf === cpf);

        return record !== undefined;
    }


    toRecord(patient: Patients): PatientRecord {
        return {
            id: patient.id as number,
            name: patient.name,
            birthday: patient.birthday.toISOString(),
            cpf: patient.cpf.toString(),
        };
    }
}
