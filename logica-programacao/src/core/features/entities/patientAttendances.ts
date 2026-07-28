import {EntityBase} from "@shared/base/entity.base";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {StatusVo} from "@shared/valueObjects/status.vo";
import {ValidationError} from "@shared/errors/application.error";

export interface PatientAttendancesProps {
    id?: number;
    patientId: number;
    symptoms: string;
    arrivalAt: Date;
    priority?: PriorityVo;
    status: StatusVo;
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

    get status(): StatusVo {
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

    // private static createGeneric(props: Omit<PatientAttendancesProps, 'status'>): PatientAttendances {
    //     return new PatientAttendances({...props, status});
    // }


    static createQueue(patientId: number, symptoms: string, arrivalAt: Date): PatientAttendances {
        const status: StatusVo = StatusVo.QUEUE;

        return new PatientAttendances({
            patientId,
            symptoms,
            arrivalAt,
            priority: PriorityVo.EMERGENCY,
            status
        });
    }

    // static createEmergency(patientId: number, symptoms: string, arrivalAt: Date, queueNumber: number): PatientAttendances {
    //     return PatientAttendances.createGeneric({
    //         patientId,
    //         symptoms,
    //         arrivalAt,
    //         priority: PriorityVo.EMERGENCY,
    //         queueNumber
    //     });
    // }
    //
    // static createVeryUrgent(patientId: number, symptoms: string, arrivalAt: Date, queueNumber: number): PatientAttendances {
    //     return PatientAttendances.createGeneric({
    //         patientId,
    //         symptoms,
    //         arrivalAt,
    //         priority: PriorityVo.VERY_URGENT,
    //         queueNumber
    //     });
    // }
    //
    // static createUrgent(patientId: number, symptoms: string, arrivalAt: Date, queueNumber: number): PatientAttendances {
    //     return PatientAttendances.createGeneric({
    //         patientId,
    //         symptoms,
    //         arrivalAt,
    //         priority: PriorityVo.URGENT,
    //         queueNumber
    //     });
    // }
    //
    // static createLessUrgent(patientId: number, symptoms: string, arrivalAt: Date, queueNumber: number): PatientAttendances {
    //     return PatientAttendances.createGeneric({
    //         patientId,
    //         symptoms,
    //         arrivalAt,
    //         priority: PriorityVo.LESS_URGENT,
    //         queueNumber
    //     });
    // }
    //
    // static createNotUrgent(patientId: number, symptoms: string, arrivalAt: Date, queueNumber: number): PatientAttendances {
    //     return PatientAttendances.createGeneric({
    //         patientId,
    //         symptoms,
    //         arrivalAt,
    //         priority: PriorityVo.NOT_URGENT,
    //         queueNumber
    //     });
    // }
}
