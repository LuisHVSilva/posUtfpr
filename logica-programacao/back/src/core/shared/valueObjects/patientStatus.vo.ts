import {VoBase} from "@shared/base/vo.base";

export enum PatientStatusEnum {
    TRIAGE = "TRIAGE",
    QUEUE = "QUEUE",
    TREATMENT = "TREATMENT",
    COMPLETED = "COMPLETED",
}

export class PatientStatusVo extends VoBase<PatientStatusEnum> {
    public static readonly TRIAGE: PatientStatusVo = new PatientStatusVo(PatientStatusEnum.TRIAGE);
    public static readonly QUEUE: PatientStatusVo = new PatientStatusVo(PatientStatusEnum.QUEUE);
    public static readonly TREATMENT: PatientStatusVo = new PatientStatusVo(PatientStatusEnum.TREATMENT);
    public static readonly COMPLETED: PatientStatusVo = new PatientStatusVo(PatientStatusEnum.COMPLETED);

    private constructor(value: PatientStatusEnum) {
        super(value);
    }

    static create(value: PatientStatusEnum): PatientStatusVo {
        return new PatientStatusVo(value);
    }

    static fromPersistence(value: string): PatientStatusVo {
        this.assertIn<PatientStatusEnum>(value, Object.values(PatientStatusEnum), "PatientStatusEnum");
        return new PatientStatusVo(value as PatientStatusEnum);
    }

    isTriage(): boolean {
        return this.value === PatientStatusEnum.TRIAGE;
    }

    isQueue(): boolean {
        return this.value === PatientStatusEnum.QUEUE;
    }

    isTreatment(): boolean {
        return this.value === PatientStatusEnum.TREATMENT;
    }

    isCompleted(): boolean {
        return this.value === PatientStatusEnum.COMPLETED;
    }

    toString(): string {
        return this.value;
    }
}
