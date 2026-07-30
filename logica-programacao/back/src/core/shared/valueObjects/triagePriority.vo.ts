import {VoBase} from "@shared/base/vo.base";

export enum PriorityEnum {
    EMERGENCY = "EMERGENCY",
    VERY_URGENT = "VERY_URGENT",
    URGENT = "URGENT",
    LESS_URGENT = "LESS_URGENT",
    NOT_URGENT = "NOT_URGENT",
}

export class PriorityVo extends VoBase<PriorityEnum> {
    public static readonly EMERGENCY: PriorityVo = new PriorityVo(PriorityEnum.EMERGENCY);
    public static readonly VERY_URGENT: PriorityVo = new PriorityVo(PriorityEnum.VERY_URGENT);
    public static readonly URGENT: PriorityVo = new PriorityVo(PriorityEnum.URGENT);
    public static readonly LESS_URGENT: PriorityVo = new PriorityVo(PriorityEnum.LESS_URGENT);
    public static readonly NOT_URGENT: PriorityVo = new PriorityVo(PriorityEnum.NOT_URGENT);

    private static readonly ptBrMap: Record<PriorityEnum, string> = {
        [PriorityEnum.EMERGENCY]: "Emergência",
        [PriorityEnum.VERY_URGENT]: "Muito urgente",
        [PriorityEnum.URGENT]: "Urgente",
        [PriorityEnum.LESS_URGENT]: "Pouco urgente",
        [PriorityEnum.NOT_URGENT]: "Sem urgência",
    }


    private static readonly WEIGHTS: Record<PriorityEnum, number> = {
        [PriorityEnum.EMERGENCY]: 1,
        [PriorityEnum.VERY_URGENT]: 2,
        [PriorityEnum.URGENT]: 3,
        [PriorityEnum.LESS_URGENT]: 4,
        [PriorityEnum.NOT_URGENT]: 5,
    };

    private constructor(value: PriorityEnum) {
        super(value);
    }

    static getMetadata() {
        return Object.values(PriorityEnum).map(triage => ({
            key: triage,
            label: this.ptBrMap[triage],
        }));
    }

    static create(value: string): PriorityVo {
        this.assertIn<PriorityEnum>(value, Object.values(PriorityEnum), "PriorityEnum");

        return new PriorityVo(value);
    }

    static fromPersistence(value: string): PriorityVo {
        this.assertIn<PriorityEnum>(value, Object.values(PriorityEnum), "PriorityEnum");

        return new PriorityVo(value as PriorityEnum);
    }

    get weight(): number {
        return PriorityVo.WEIGHTS[this.value];
    }

    isEmergency(): boolean {
        return this.value === PriorityEnum.EMERGENCY;
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