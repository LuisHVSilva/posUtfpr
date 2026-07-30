import {inject, injectable} from "tsyringe";
import {BusinessRuleError, NotFoundError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {PatientStatusVo} from "@shared/valueObjects/patientStatus.vo";
import {QueueAttendanceService} from "@features/services/queueAttendance.service";
import {ActiveQueueEntry} from "@features/entities/activeQueueEntry";

@injectable()
export class PatientAttendancesService {
    constructor(
        @inject("PatientAttendancesPersistence")
        private patientAttendancesPersistence: PatientAttendancesPersistence,
        @inject("QueueAttendanceService")
        private readonly queueAttendanceService: QueueAttendanceService,
    ) {
    }

    async registerAttendance(patientId: number, symptoms: string, isEmergency: boolean): Promise<PatientAttendances> {
        const arrivalAtDate: Date = DateUtil.parse(new Date());
        const patientAttendance = new PatientAttendances({
            patientId,
            symptoms,
            arrivalAt: arrivalAtDate,
            priority: isEmergency ? PriorityVo.EMERGENCY : undefined,
            status: PatientStatusVo.QUEUE,
        });

        const existsPatientId: PatientAttendances[] = await this.patientAttendancesPersistence.findByPatientId(patientAttendance.patientId);

        if (existsPatientId.some((attendance) => !attendance.status.isCompleted())) {
            throw new BusinessRuleError("This patient is already undergoing treatment.");
        }

        return await this.patientAttendancesPersistence.save(patientAttendance);
    }

    async findByPk(attendanceId: number): Promise<PatientAttendances | null> {
        return this.patientAttendancesPersistence.findByPk(attendanceId);
    }

    async finishTriage(attendanceId: number, priority: PriorityVo): Promise<{
        attendance: PatientAttendances;
        nextPatient: ActiveQueueEntry | null
    }> {
        const attendance: PatientAttendances | null = await this.patientAttendancesPersistence.findByPk(attendanceId);

        if (!attendance) {
            throw new NotFoundError(`Attendance ${attendanceId} does not exist`);
        }

        const updatedAttendance: PatientAttendances = attendance.finalizeTriage(priority);
        const savedAttendance: PatientAttendances =
            await this.patientAttendancesPersistence.update(updatedAttendance);

        // Depois de salvar o novo status, a fila remove o atendimento atual
        // e tenta preencher a mesma sala com o próximo paciente da triagem.
        const nextPatient: ActiveQueueEntry | null =
            await this.queueAttendanceService.finalizeTriage(attendanceId);

        return {
            attendance: savedAttendance,
            nextPatient,
        };
    }
}
