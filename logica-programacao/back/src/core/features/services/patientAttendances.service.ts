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

    /**
     * Calcula o tempo médio do atendimento completo, da chegada até a saída.
     * Atendimentos ainda em andamento não entram na média.
     */
    async getAverageWait(): Promise<string> {
        const completedAttendances = (await this.patientAttendancesPersistence.findAll())
            .filter((attendance) =>
                attendance.status.isCompleted() && attendance.treatmentFinishedAt,
            );

        if (completedAttendances.length === 0) {
            return "0 min";
        }

        const totalMilliseconds = completedAttendances.reduce(
            (total, attendance) =>
                total + (attendance.treatmentFinishedAt!.getTime() - attendance.arrivalAt.getTime()),
            0,
        );
        const averageMinutes = totalMilliseconds / completedAttendances.length / 60000;

        return `${Number(averageMinutes.toFixed(1))} min`;
    }

    async finishTriage(roomId: number, priority: PriorityVo): Promise<{
        attendance: PatientAttendances;
        nextPatient: ActiveQueueEntry | null
    }> {
        const activeEntry = await this.queueAttendanceService.findActiveTriageEntryByRoomId(roomId);
        const attendanceId = activeEntry.attendanceId;
        const attendance: PatientAttendances | null = await this.patientAttendancesPersistence.findByPk(attendanceId);

        if (!attendance) {
            throw new NotFoundError(`Attendance ${attendanceId} does not exist`);
        }

        const updatedAttendance: PatientAttendances = attendance.finalizeTriage(priority);
        const savedAttendance: PatientAttendances = await this.patientAttendancesPersistence.update(updatedAttendance);
        const nextPatient: ActiveQueueEntry | null = await this.queueAttendanceService.finalizeTriage(attendanceId);
        await this.queueAttendanceService.enqueue(savedAttendance);

        return {
            attendance: await this.patientAttendancesPersistence.findByPk(attendanceId) ?? savedAttendance,
            nextPatient,
        };
    }

    async finishAttendance(roomId: number): Promise<{
        attendance: PatientAttendances;
        nextPatient: ActiveQueueEntry | null
    }> {
        const activeEntry = await this.queueAttendanceService.findActiveTreatmentEntryByRoomId(roomId);
        const attendanceId = activeEntry.attendanceId;
        const attendance: PatientAttendances | null = await this.patientAttendancesPersistence.findByPk(attendanceId);

        if (!attendance) {
            throw new NotFoundError(`Attendance ${attendanceId} does not exist`);
        }

        const updatedAttendance: PatientAttendances = attendance.finalizeTreatment();
        const savedAttendance: PatientAttendances = await this.patientAttendancesPersistence.update(updatedAttendance);
        const nextPatient: ActiveQueueEntry | null = await this.queueAttendanceService.finalizeAttendance(attendanceId);

        return {
            attendance: savedAttendance,
            nextPatient,
        };
    }
}
