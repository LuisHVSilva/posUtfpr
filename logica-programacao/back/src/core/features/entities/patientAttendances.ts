import {EntityBase} from "@shared/base/entity.base";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {PatientStatusVo} from "@shared/valueObjects/patientStatus.vo";
import {BusinessRuleError, ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";

export interface PatientAttendancesProps {
    id?: number;
    patientId: number;
    symptoms: string;
    arrivalAt: Date;
    priority?: PriorityVo;
    status: PatientStatusVo;
    triageStartedAt?: Date;
    triageFinishedAt?: Date;
    treatmentStartedAt?: Date;
    treatmentFinishedAt?: Date;
}

export class PatientAttendances extends EntityBase<PatientAttendancesProps> {
    constructor(props: PatientAttendancesProps) {
        super(props);
        this.validations();
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get patientId(): number {
        return this.props.patientId;
    }

    get symptoms(): string {
        return this.props.symptoms;
    }

    get arrivalAt(): Date {
        return this.props.arrivalAt;
    }

    get priority(): PriorityVo | undefined {
        return this.props.priority;
    }

    get status(): PatientStatusVo {
        return this.props.status;
    }

    get triageStartedAt(): Date | undefined {
        return this.props.triageStartedAt;
    }

    get triageFinishedAt(): Date | undefined {
        return this.props.triageFinishedAt;
    }

    get treatmentStartedAt(): Date | undefined {
        return this.props.treatmentStartedAt;
    }

    get treatmentFinishedAt(): Date | undefined {
        return this.props.treatmentFinishedAt;
    }

    private validatePositiveNumber(): void {
        if (this.patientId <= 0) {
            throw new ValidationError("Patient ID must be positive integer");
        }
    }

    private validateDates(): void {
        if (this.treatmentFinishedAt && !this.treatmentStartedAt) {
            throw new ValidationError("Treatment cannot be finished before it is started");
        }

        if (this.treatmentStartedAt && this.treatmentFinishedAt && this.treatmentStartedAt > this.treatmentFinishedAt) {
            throw new ValidationError("Treatment start date cannot be after treatment finish date");
        }

        if (this.triageFinishedAt && !this.triageStartedAt) {
            throw new ValidationError("Triage cannot be finished before it is started");
        }

        if (this.triageStartedAt && this.triageFinishedAt && this.triageStartedAt > this.triageFinishedAt) {
            throw new ValidationError("Triage start date cannot be after triage finish date");
        }
    }

    private validations(): void {
        this.validatePositiveNumber();
        this.validateDates();
    }

    static createQueue(patientId: number, symptoms: string, arrivalAt: Date): PatientAttendances {
        const status: PatientStatusVo = PatientStatusVo.QUEUE;

        return new PatientAttendances({
            patientId,
            symptoms,
            arrivalAt,
            priority: PriorityVo.EMERGENCY,
            status
        });
    }

    finalizeTriage(priority: PriorityVo): this {
        if (!this.status.isTriage()) {
            throw new BusinessRuleError(`PatientId is not triage`);
        }

        return this.cloneWith({
            triageFinishedAt: DateUtil.now(),
            status: PatientStatusVo.QUEUE,
            priority,
        });
    }

    startTriage(): this {
        if (!this.status.isQueue()) {
            throw new BusinessRuleError(`PatientId is not waiting for triage`);
        }

        return this.cloneWith({
            status: PatientStatusVo.TRIAGE,
            triageStartedAt: DateUtil.now(),
        });
    }

}
