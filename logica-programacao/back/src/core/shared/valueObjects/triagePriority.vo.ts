import {VoBase} from "@shared/base/vo.base";

export enum Priority {
    EMERGENCY = "EMERGENCY",
    VERY_URGENT = "VERY_URGENT",
    URGENT = "URGENT",
    LESS_URGENT = "LESS_URGENT",
    NOT_URGENT = "NOT_URGENT",
}

export class PriorityVo extends VoBase<Priority> {
    public static readonly EMERGENCY: PriorityVo = new PriorityVo(Priority.EMERGENCY);
    public static readonly VERY_URGENT: PriorityVo = new PriorityVo(Priority.VERY_URGENT);
    public static readonly URGENT: PriorityVo = new PriorityVo(Priority.URGENT);
    public static readonly LESS_URGENT: PriorityVo = new PriorityVo(Priority.LESS_URGENT);
    public static readonly NOT_URGENT: PriorityVo = new PriorityVo(Priority.NOT_URGENT);

    private static readonly WEIGHTS: Record<Priority, number> = {
        [Priority.EMERGENCY]: 1,
        [Priority.VERY_URGENT]: 2,
        [Priority.URGENT]: 3,
        [Priority.LESS_URGENT]: 4,
        [Priority.NOT_URGENT]: 5,
    };

    private constructor(value: Priority) {
        super(value);
    }

    static create(value: string): PriorityVo {
        this.assertIn<Priority>(value, Object.values(Priority), "priority");

        return new PriorityVo(value);
    }

    static fromPersistence(value: string): PriorityVo {
        this.assertIn<Priority>(value, Object.values(Priority), "priority");

        return new PriorityVo(value as Priority);
    }

    get weight(): number {
        return PriorityVo.WEIGHTS[this.value];
    }

    isEmergency(): boolean {
        return this.value === Priority.EMERGENCY;
    }

    isHigherThan(other: PriorityVo): boolean {
        return this.weight < other.weight;
    }

    isLowerThan(other: PriorityVo): boolean {
        return this.weight > other.weight;
    }

    hasSamePriorityAs(other: PriorityVo): boolean {
        return this.weight === other.weight;
    }

    toString(): string {
        return this.value;
    }
}