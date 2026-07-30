import {EntityBase} from "@shared/base/entity.base";
import {ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {ActiveQueueEntry} from "@features/entities/activeQueueEntry";
import {QueueEntry} from "@features/entities/queueEntry";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";

export interface QueueAttendanceProps {
    id?: number;
    date: Date;
    type: QueueEntryTypeVo;
    nextCallNumber: number;
    waiting: QueueEntry[];
    active: ActiveQueueEntry[];
    maxActiveCalls: number;
    updatedAt: Date;
}

export class QueueAttendance extends EntityBase<QueueAttendanceProps> {
    constructor(props: QueueAttendanceProps) {
        super(props);
        this.validations();
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get date(): Date {
        return this.props.date;
    }

    get type(): QueueEntryTypeVo {
        return this.props.type;
    }

    get nextCallNumber(): number {
        return this.props.nextCallNumber;
    }

    get waiting(): QueueEntry[] {
        return [...this.props.waiting];
    }

    get active(): ActiveQueueEntry[] {
        return [...this.props.active];
    }

    get maxActiveCalls(): number {
        return this.props.maxActiveCalls;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    static create(
        date: Date,
        type: QueueEntryTypeVo,
        maxActiveCalls: number,
    ): QueueAttendance {
        return new QueueAttendance({
            date,
            type,
            nextCallNumber: 1,
            waiting: [],
            active: [],
            maxActiveCalls,
            updatedAt: DateUtil.now(),
        });
    }

    addEntry(entry: QueueEntry): this {
        this.validateEntryType(entry);
        this.validateEntryDoesNotExist(entry);

        const waiting = [...this.waiting, entry];

        return this.cloneWith({
            waiting,
            updatedAt: DateUtil.now(),
        });
    }

    addNewEntry(
        attendanceId: number,
        patientId: number,
        priority?: QueueEntry["priority"],
        enteredAt: Date = DateUtil.now(),
    ): this {
        const entry = new QueueEntry({
            attendanceId,
            patientId,
            callNumber: this.nextCallNumber,
            queueType: this.type,
            priority,
            enteredAt,
        });

        this.validateEntryDoesNotExist(entry);

        return this.cloneWith({
            nextCallNumber: this.nextCallNumber + 1,
            waiting: [...this.waiting, entry],
            updatedAt: DateUtil.now(),
        });
    }

    callNext(doctorId: number): this {
        if (this.active.length >= this.maxActiveCalls || this.waiting.length === 0) {
            return this;
        }

        const waiting: QueueEntry[] = this.orderWaiting();
        const entry: QueueEntry = waiting.shift()!;

        const activeEntry = new ActiveQueueEntry({
            attendanceId: entry.attendanceId,
            patientId: entry.patientId,
            callNumber: entry.callNumber,
            doctorId,
            queueType: entry.queueType,
            startedAt: DateUtil.now(),
        });

        return this.cloneWith({
            waiting,
            active: [...this.active, activeEntry],
            updatedAt: DateUtil.now(),
        });
    }

    finish(attendanceId: number): this {
        const active = this.active.filter((entry) =>
            entry.attendanceId !== attendanceId,
        );

        if (active.length === this.active.length) {
            throw new ValidationError("Attendance is not active in this queue");
        }

        return this.cloneWith({
            active,
            updatedAt: DateUtil.now(),
        });
    }

    private orderWaiting(): QueueEntry[] {
        return [...this.waiting].sort((first, second) => {
            if (this.type.isTreatment()) {
                const priorityDifference =
                    first.priority!.weight - second.priority!.weight;

                if (priorityDifference !== 0) {
                    return priorityDifference;
                }
            }

            const enteredAtDifference =
                first.enteredAt.getTime() - second.enteredAt.getTime();

            return enteredAtDifference !== 0
                ? enteredAtDifference
                : first.callNumber - second.callNumber;
        });
    }

    private validateEntryType(entry: QueueEntry): void {
        if (entry.queueType.toString() !== this.type.toString()) {
            throw new ValidationError("Queue entry type must match the attendance queue type");
        }
    }

    private validateEntryDoesNotExist(entry: QueueEntry): void {
        const entries = [
            ...this.waiting,
            ...this.active.map((activeEntry) => ({
                attendanceId: activeEntry.attendanceId,
                callNumber: activeEntry.callNumber,
            })),
        ];

        if (entries.some((current) => current.attendanceId === entry.attendanceId)) {
            throw new ValidationError("Attendance is already in this queue");
        }

        if (entries.some((current) => current.callNumber === entry.callNumber)) {
            throw new ValidationError("Call number is already in this queue");
        }
    }

    private validatePositiveInteger(value: number, fieldName: string): void {
        if (!Number.isInteger(value) || value <= 0) {
            throw new ValidationError(`${fieldName} must be a positive integer`);
        }
    }

    private validateDate(value: Date, fieldName: string): void {
        if (Number.isNaN(DateUtil.parse(value).getTime())) {
            throw new ValidationError(`${fieldName} must be valid`);
        }
    }

    private validations(): void {
        if (this.id !== undefined) {
            this.validatePositiveInteger(this.id, "Queue attendance ID");
        }

        this.validateDate(this.date, "Queue date");
        this.validateDate(this.updatedAt, "Updated date");
        this.validatePositiveInteger(this.nextCallNumber, "Next call number");
        this.validatePositiveInteger(this.maxActiveCalls, "Maximum active calls");

        if (this.active.length > this.maxActiveCalls) {
            throw new ValidationError(
                "Active calls cannot exceed the maximum active calls",
            );
        }

        this.waiting.forEach((entry) => this.validateEntryType(entry));
        this.active.forEach((entry) => {
            if (entry.queueType.toString() !== this.type.toString()) {
                throw new ValidationError(
                    "Active entry type must match the attendance queue type",
                );
            }
        });

        this.validateUniqueEntries();
    }

    private validateUniqueEntries(): void {
        const attendanceIds = [
            ...this.waiting.map((entry) => entry.attendanceId),
            ...this.active.map((entry) => entry.attendanceId),
        ];
        const callNumbers = [
            ...this.waiting.map((entry) => entry.callNumber),
            ...this.active.map((entry) => entry.callNumber),
        ];
        const doctorIds = this.active.map((entry) => entry.doctorId);

        if (new Set(attendanceIds).size !== attendanceIds.length) {
            throw new ValidationError("Attendance cannot be repeated in a queue");
        }

        if (new Set(callNumbers).size !== callNumbers.length) {
            throw new ValidationError("Call number cannot be repeated in a queue");
        }

        if (new Set(doctorIds).size !== doctorIds.length) {
            throw new ValidationError("Doctor cannot have more than one active call");
        }
    }
}
