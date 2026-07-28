import "reflect-metadata";
import {container} from "tsyringe";
import {PatientsService} from "@features/services/patients.service";
import {PatientAttendancesService} from "@features/services/patientAttendances.service";
import {QueueAttendanceService} from "@features/services/queueAttendance.service";


container.registerSingleton<PatientsService>("PatientsService", PatientsService);
container.registerSingleton<PatientAttendancesService>("PatientAttendancesService", PatientAttendancesService);
container.registerSingleton<QueueAttendanceService>("QueueAttendanceService", QueueAttendanceService);

export {container}
