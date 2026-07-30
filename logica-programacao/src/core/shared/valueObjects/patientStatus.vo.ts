import {VoBase} from "@shared/base/vo.base";

export enum Status {
    TRIAGE = "TRIAGE",
    QUEUE = "QUEUE",
    TREATMENT = "TREATMENT",
    COMPLETED = "COMPLETED",
}

export class StatusVo extends VoBase<Status> {
    public static readonly TRIAGE: StatusVo = new StatusVo(Status.TRIAGE);
    public static readonly QUEUE: StatusVo = new StatusVo(Status.QUEUE);
    public static readonly TREATMENT: StatusVo = new StatusVo(Status.TREATMENT);
    public static readonly COMPLETED: StatusVo = new StatusVo(Status.COMPLETED);

    private constructor(value: Status) {
        super(value);
    }

    static create(value: Status): StatusVo {
        return new StatusVo(value);
    }

    static fromPersistence(value: string): StatusVo {
        this.assertIn<Status>(value, Object.values(Status), "status");
        return new StatusVo(value as Status);
    }

    isTriage(): boolean {
        return this.value === Status.TRIAGE;
    }

    isCompleted(): boolean {
        return this.value === Status.COMPLETED;
    }

    toString(): string {
        return this.value;
    }
}
