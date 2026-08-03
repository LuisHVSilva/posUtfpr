import "reflect-metadata";
import {Doctor} from "@features/entities/doctor";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {Patients} from "@features/entities/patients";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {Rooms} from "@features/entities/rooms";
import {DoctorsPersistence} from "@features/persistences/doctors.persistence";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {PatientsPersistence} from "@features/persistences/patients.persistence";
import {QueueAttendancePersistence} from "@features/persistences/queueAttendence.persistence";
import {RoomsPersistence} from "@features/persistences/rooms.persistence";
import {PatientAttendancesService} from "@features/services/patientAttendances.service";
import {PatientsService} from "@features/services/patients.service";
import {QueueAttendanceService} from "@features/services/queueAttendance.service";
import {RoomsService} from "@features/services/rooms.service";
import {
    MemoryAttendancesRepository,
    MemoryDoctorsRepository,
    MemoryPatientsRepository,
    MemoryQueueRepository,
    MemoryRoomsRepository,
} from "./in-memory-repositories";

export type ServiceSeed = {
    patients?: Patients[];
    attendances?: PatientAttendances[];
    queues?: QueueAttendance[];
    rooms?: Rooms[];
    doctors?: Doctor[];
};

export function services(seed: ServiceSeed = {}) {
    const patientsRepository = new MemoryPatientsRepository(seed.patients);
    const attendancesRepository = new MemoryAttendancesRepository(seed.attendances);
    const queuesRepository = new MemoryQueueRepository(seed.queues);
    const roomsRepository = new MemoryRoomsRepository(seed.rooms);
    const doctorsRepository = new MemoryDoctorsRepository(seed.doctors);
    const roomsService = new RoomsService(
        roomsRepository as unknown as RoomsPersistence,
        doctorsRepository as unknown as DoctorsPersistence,
    );
    const queueService = new QueueAttendanceService(
        queuesRepository as unknown as QueueAttendancePersistence,
        attendancesRepository as unknown as PatientAttendancesPersistence,
        roomsService,
    );
    const patientsService = new PatientsService(
        patientsRepository as unknown as PatientsPersistence,
        attendancesRepository as unknown as PatientAttendancesPersistence,
        queuesRepository as unknown as QueueAttendancePersistence,
    );
    const attendancesService = new PatientAttendancesService(
        attendancesRepository as unknown as PatientAttendancesPersistence,
        queueService,
    );

    return {
        patientsRepository,
        attendancesRepository,
        queuesRepository,
        roomsRepository,
        doctorsRepository,
        roomsService,
        queueService,
        patientsService,
        attendancesService,
    };
}
