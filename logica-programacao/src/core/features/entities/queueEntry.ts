import {EntityBase} from "@shared/base/entity.base";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";

export type QueueEntryType = "TRIAGE" | "TREATMENT";

export interface QueueEntryProps {
    id?: number;
    attendanceId: number;
    patientId: number;
    callNumber: number;
    queueType: QueueEntryType;
    priority?: PriorityVo;
    enteredAt: Date;
}

export class QueueEntry extends EntityBase<QueueEntryProps> {
    constructor(props: QueueEntryProps) {
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

    get queueType(): QueueEntryType {
        return this.props.queueType;
    }

    get priority(): PriorityVo | undefined {
        return this.props.priority;
    }

    get enteredAt(): Date {
        return this.props.enteredAt;
    }

    private validatePositiveInteger(value: number, fieldName: string): void {
        if (!Number.isInteger(value) || value <= 0) {
            throw new ValidationError(`${fieldName} must be a positive integer`);
        }
    }

    private validateQueueType(): void {
        if (this.queueType !== "TRIAGE" && this.queueType !== "TREATMENT") {
            throw new ValidationError("Queue type must be TRIAGE or TREATMENT");
        }
    }

    private validatePriority(): void {
        if (this.queueType === "TREATMENT" && !this.priority) {
            throw new ValidationError(
                "Treatment queue entries must have a priority",
            );
        }
    }

    private validateEnteredAt(): void {
        const enteredAt = DateUtil.parse(this.enteredAt);

        if (Number.isNaN(enteredAt.getTime())) {
            throw new ValidationError("Entry date must be valid");
        }

        if (enteredAt.getTime() > DateUtil.now().getTime()) {
            throw new ValidationError("Entry date cannot be in the future");
        }
    }

    private validations(): void {
        if (this.id !== undefined) {
            this.validatePositiveInteger(this.id, "Queue entry ID");
        }

        this.validatePositiveInteger(this.attendanceId, "Attendance ID");
        this.validatePositiveInteger(this.patientId, "Patient ID");
        this.validatePositiveInteger(this.callNumber, "Call number");
        this.validateQueueType();
        this.validatePriority();
        this.validateEnteredAt();
    }
}
