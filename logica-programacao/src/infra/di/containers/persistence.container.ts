import "reflect-metadata";
import {container} from "tsyringe";
import {PatientsPersistence} from "@features/persistences/patients.persistence";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {QueueAttendancePersistence} from "@features/persistences/queueAttendence.persistence";

container.registerSingleton<PatientsPersistence>("PatientsPersistence", PatientsPersistence);
container.registerSingleton<PatientAttendancesPersistence>("PatientAttendancesPersistence", PatientAttendancesPersistence);
container.registerSingleton<QueueAttendancePersistence>("QueueAttendancePersistence", QueueAttendancePersistence);

export {container}
