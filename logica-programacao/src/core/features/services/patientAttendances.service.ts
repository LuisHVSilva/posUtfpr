import {inject, injectable} from "tsyringe";
import {BusinessRuleError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {StatusVo} from "@shared/valueObjects/status.vo";

@injectable()
export class PatientAttendancesService {
    constructor(
        @inject("PatientAttendancesPersistence")
        private patientAttendancesPersistence: PatientAttendancesPersistence
    ) {
    }

    async registerAttendance(
        patientId: number,
        symptoms: string,
        isEmergency: boolean,
    ): Promise<PatientAttendances> {
        const arrivalAtDate: Date = DateUtil.parse(new Date());
        const patientAttendance = new PatientAttendances({
            patientId,
            symptoms,
            arrivalAt: arrivalAtDate,
            priority: isEmergency ? PriorityVo.EMERGENCY : undefined,
            status: StatusVo.QUEUE,
        });

        const existsPatientId: PatientAttendances[] = await this.patientAttendancesPersistence.findByPatientId(patientAttendance.patientId);

        if (existsPatientId.some((attendance) => !attendance.status.isCompleted())) {
            throw new BusinessRuleError("This patient is already undergoing treatment.");
        }

        return await this.patientAttendancesPersistence.save(patientAttendance);
    }
}
