import {Doctor} from "@features/entities/doctor";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {Patients} from "@features/entities/patients";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {Rooms} from "@features/entities/rooms";
import {EntityBase} from "@shared/base/entity.base";

type PropsWithId = { id?: number };
type EntityClass<TProps extends PropsWithId, TEntity> = {
    rehydrate(props: TProps): TEntity;
};

export class MemoryRepository<
    TProps extends PropsWithId,
    TEntity extends EntityBase<TProps> & PropsWithId,
> {
    private nextId = 1;

    constructor(
        private readonly entityClass: EntityClass<TProps, TEntity>,
        public items: TEntity[] = [],
    ) {
        const ids = items.map((item) => item.id ?? 0);
        this.nextId = Math.max(0, ...ids) + 1;
    }

    async save(entity: TEntity): Promise<TEntity> {
        const saved = this.entityClass.rehydrate({
            ...entity.getProps(),
            id: this.nextId++,
        });

        this.items.push(saved);
        return saved;
    }

    async findByPk(id: number): Promise<TEntity | null> {
        return this.items.find((item) => item.id === id) ?? null;
    }

    async findAll(): Promise<TEntity[]> {
        return [...this.items];
    }

    async update(entity: TEntity): Promise<TEntity> {
        const index = this.items.findIndex((item) => item.id === entity.id);
        this.items[index] = entity;
        return entity;
    }

    async deleteByPk(id: number): Promise<void> {
        const index = this.items.findIndex((item) => item.id === id);
        this.items.splice(index, 1);
    }
}

export class MemoryPatientsRepository extends MemoryRepository<ReturnType<Patients["getProps"]>, Patients> {
    constructor(items: Patients[] = []) {
        super(Patients, items);
    }

    async existsByCpf(cpf: string): Promise<boolean> {
        return this.items.some((patient) => patient.cpf.toString() === cpf);
    }

    async findByCpf(cpf: string): Promise<Patients | null> {
        return this.items.find((patient) => patient.cpf.toString() === cpf) ?? null;
    }
}

export class MemoryAttendancesRepository extends MemoryRepository<
    ReturnType<PatientAttendances["getProps"]>,
    PatientAttendances
> {
    constructor(items: PatientAttendances[] = []) {
        super(PatientAttendances, items);
    }

    async findByPatientId(patientId: number): Promise<PatientAttendances[]> {
        return this.items.filter((attendance) => attendance.patientId === patientId);
    }
}

export class MemoryQueueRepository extends MemoryRepository<
    ReturnType<QueueAttendance["getProps"]>,
    QueueAttendance
> {
    constructor(items: QueueAttendance[] = []) {
        super(QueueAttendance, items);
    }

    async findByAttendanceId(attendanceId: number): Promise<QueueAttendance | null> {
        return this.items.find((queue) =>
            queue.waiting.some((entry) => entry.attendanceId === attendanceId) ||
            queue.active.some((entry) => entry.attendanceId === attendanceId),
        ) ?? null;
    }
}

export class MemoryRoomsRepository extends MemoryRepository<ReturnType<Rooms["getProps"]>, Rooms> {
    constructor(items: Rooms[] = []) {
        super(Rooms, items);
    }
}

export class MemoryDoctorsRepository extends MemoryRepository<ReturnType<Doctor["getProps"]>, Doctor> {
    constructor(items: Doctor[] = []) {
        super(Doctor, items);
    }
}
