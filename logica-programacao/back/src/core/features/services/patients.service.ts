import {inject, injectable} from "tsyringe";
import {BusinessRuleError, NotFoundError, ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientsPersistence} from "@features/persistences/patients.persistence";
import {Patients} from "@features/entities/patients";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {PatientFilters} from "@features/schemas/patients/patientFilters.schema";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {QueueAttendancePersistence} from "@features/persistences/queueAttendence.persistence";
import {PatientAttendances} from "@features/entities/patientAttendances";

export type ListPatientsFilters = PatientFilters & {page: number};
export type PatientTableStatus = "emergency" | "urgent" | "stable";

export interface ListPatientsItem {
    patient: Patients;
    status: PatientTableStatus;
}

export interface ListPatientsResult {
    patients: ListPatientsItem[];
    pagination: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface PatientsSummaryResult {
    totalRecords: number;
    attendancesToday: number;
    criticalCases: number;
    waitingTriage: number;
}

@injectable()
export class PatientsService {
    private static readonly ITEMS_PER_PAGE = 20;

    constructor(
        @inject("PatientsPersistence")
        private patientsRepository: PatientsPersistence,
        @inject("PatientAttendancesPersistence")
        private patientAttendancesPersistence: PatientAttendancesPersistence,
        @inject("QueueAttendancePersistence")
        private queueAttendancePersistence: QueueAttendancePersistence,
    ) {
    }

    async registerPatients(name: string, birthday: string, cpf: string): Promise<Patients> {
        const birthdayDate: Date = DateUtil.parse(birthday);
        const patient: Patients = Patients.create(name, birthdayDate, cpf);

        const exists: boolean = await this.patientsRepository.existsByCpf(patient.cpf.toString());

        if (exists) {
            throw new BusinessRuleError(`Patient already exists for cpf: ${patient.cpf.toString()}`);
        }

        return await this.patientsRepository.save(patient);
    }

    /**
     * Fluxo usado pela recepção.
     *
     * Diferentemente de registerPatients, este método não considera o CPF
     * existente um erro: ele reutiliza o cadastro e permite criar um novo
     * atendimento para essa mesma pessoa.
     */
    async findOrCreatePatient(
        name: string,
        birthday: string,
        cpf: string,
    ): Promise<Patients> {
        const cpfVo = CpfVo.createCpf(cpf);
        const existingPatient = await this.patientsRepository.findByCpf(cpfVo.toString());

        if (existingPatient) {
            return existingPatient;
        }

        return this.patientsRepository.save(
            Patients.create(name, DateUtil.parse(birthday), cpfVo.toString()),
        );
    }

    async findByPk(patientId: number): Promise<Patients | null> {
        return this.patientsRepository.findByPk(patientId);
    }

    async updateRegistration(id: number, name?: string, cpf?: string, birthday?: string): Promise<Patients> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError("Patient id must be a positive integer");
        }

        const patient: Patients | null = await this.patientsRepository.findByPk(id);

        if (!patient) {
            throw new NotFoundError(`Patient ${id} not found`);
        }

        let updatedPatient = patient;

        if (cpf !== undefined) {
            const cpfVo: CpfVo = CpfVo.createCpf(cpf);
            const findByCpf: Patients | null = await this.patientsRepository.findByCpf(cpfVo.toString())

            if (findByCpf && findByCpf.id !== id) {
                throw new BusinessRuleError(`Cpf ${findByCpf.id} already exists.`);
            }

            updatedPatient = updatedPatient.updateCpf(cpfVo);
        }

        if (name !== undefined) {
            updatedPatient = updatedPatient.updateName(name);
        }

        if (birthday !== undefined) {
            updatedPatient = updatedPatient.updateBirthday(DateUtil.parse(birthday));
        }

        return await this.patientsRepository.update(updatedPatient);
    }

    async listPatients(filters: ListPatientsFilters): Promise<ListPatientsResult> {
        const patients: Patients[] = await this.patientsRepository.findAll();
        const filteredPatients = patients.filter((patient) => {
            const matchesId = filters.id === undefined || patient.id === filters.id;
            const matchesName = filters.name === undefined ||
                patient.name.toLowerCase().includes(filters.name.toLowerCase());
            const matchesCpf = filters.cpf === undefined || patient.cpf.toString() === filters.cpf;
            const matchesBirthday = filters.birthday === undefined ||
                patient.birthday.toISOString().slice(0, 10) === filters.birthday;

            return matchesId && matchesName && matchesCpf && matchesBirthday;
        });

        const totalItems = filteredPatients.length;
        const totalPages = Math.ceil(totalItems / PatientsService.ITEMS_PER_PAGE);
        const start = (filters.page - 1) * PatientsService.ITEMS_PER_PAGE;
        const pagePatients = filteredPatients.slice(start, start + PatientsService.ITEMS_PER_PAGE);
        const attendances = await this.patientAttendancesPersistence.findAll();

        return {
            patients: pagePatients.map((patient) => ({
                patient,
                status: this.resolvePatientStatus(patient.id!, attendances),
            })),
            pagination: {
                currentPage: filters.page,
                itemsPerPage: PatientsService.ITEMS_PER_PAGE,
                totalItems,
                totalPages,
            },
        };
    }

    private resolvePatientStatus(patientId: number, attendances: PatientAttendances[]): PatientTableStatus {
        const activeAttendance = attendances
            .filter((attendance) =>
                attendance.patientId === patientId && !attendance.status.isCompleted(),
            )
            .sort((first, second) =>
                second.arrivalAt.getTime() - first.arrivalAt.getTime(),
            )[0];

        const priority = activeAttendance?.priority?.toString();

        if (priority === "EMERGENCY") {
            return "emergency";
        }

        if (priority === "VERY_URGENT" || priority === "URGENT") {
            return "urgent";
        }

        return "stable";
    }

    async getSummary(): Promise<PatientsSummaryResult> {
        const today = DateUtil.today().toISOString().slice(0, 10);
        const [patients, attendances, queues] = await Promise.all([
            this.patientsRepository.findAll(),
            this.patientAttendancesPersistence.findAll(),
            this.queueAttendancePersistence.findAll(),
        ]);

        const todayAttendances = attendances.filter((attendance) =>
            attendance.arrivalAt.toISOString().slice(0, 10) === today,
        );
        const todayQueues = queues.filter((queue) =>
            queue.date.toISOString().slice(0, 10) === today,
        );

        return {
            totalRecords: patients.length,
            attendancesToday: todayAttendances.length,
            criticalCases: todayAttendances.filter((attendance) =>
                attendance.priority?.isEmergency() && !attendance.status.isCompleted(),
            ).length,
            waitingTriage: todayQueues
                .filter((queue) => queue.type.isTriage())
                .reduce((total, queue) => total + queue.waiting.length, 0),
        };
    }
}
