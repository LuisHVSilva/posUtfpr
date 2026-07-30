import {VoBase} from "@shared/base/vo.base";

enum QueueEntryTypeEnum {
    TRIAGE = "TRIAGE",
    TREATMENT = "TREATMENT",
}

export class QueueEntryTypeVo extends VoBase<QueueEntryTypeEnum> {
    public static readonly TRIAGE: QueueEntryTypeVo = new QueueEntryTypeVo(QueueEntryTypeEnum.TRIAGE);
    public static readonly TREATMENT: QueueEntryTypeVo = new QueueEntryTypeVo(QueueEntryTypeEnum.TREATMENT);

    private constructor(value: QueueEntryTypeEnum) {
        super(value);
    }

    static create(value: QueueEntryTypeEnum): QueueEntryTypeVo {
        return new QueueEntryTypeVo(value);
    }

    static fromPersistence(value: string): QueueEntryTypeVo {
        this.assertIn<QueueEntryTypeEnum>(value, Object.values(QueueEntryTypeEnum), "QueueEntryTypeEnum");
        return new QueueEntryTypeVo(value as QueueEntryTypeEnum);
    }

    isTriage(): boolean {
        return this.value === QueueEntryTypeEnum.TRIAGE;
    }

    isTreatment(): boolean {
        return this.value === QueueEntryTypeEnum.TREATMENT;
    }

    toString(): string {
        return this.value;
    }
}
