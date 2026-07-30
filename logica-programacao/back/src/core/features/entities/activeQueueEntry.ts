import {EntityBase} from "@shared/base/entity.base";
import {ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";

export interface ActiveQueueEntryProps {
    id?: number;
    attendanceId: number;
    patientId: number;
    callNumber: number;
    doctorId: number;
    queueType: QueueEntryTypeVo;
    startedAt: Date;
}

export class ActiveQueueEntry extends EntityBase<ActiveQueueEntryProps> {
    constructor(props: ActiveQueueEntryProps) {
        super(props);
        this.validations();
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get attendanceId(): number {
        return this.props.attendanceId;
    }

    get patientId(): number {
        return this.props.patientId;
    }

    get callNumber(): number {
        return this.props.callNumber;
    }

    get doctorId(): number {
        return this.props.doctorId;
    }

    get queueType(): QueueEntryTypeVo {
        return this.props.queueType;
    }

    get startedAt(): Date {
        return this.props.startedAt;
    }

    private validateId(value: number, fieldName: string): void {
        if (!Number.isInteger(value) || value <= 0) {
            throw new ValidationError(`${fieldName} must be a positive integer`);
        }
    }

    private validateStartedAt(): void {
        const startedAt = DateUtil.parse(this.startedAt);

        if (Number.isNaN(startedAt.getTime())) {
            throw new ValidationError("Started date must be valid");
        }

        if (startedAt.getTime() > DateUtil.now().getTime()) {
            throw new ValidationError("Started date cannot be in the future");
        }
    }

    private validations(): void {
        if (this.id !== undefined) {
            this.validateId(this.id, "Active queue entry ID");
        }

        this.validateId(this.attendanceId, "Attendance ID");
        this.validateId(this.patientId, "Patient ID");
        this.validateId(this.callNumber, "Call number");
        this.validateId(this.doctorId, "Doctor ID");
        this.validateStartedAt();
    }
}
