import {VoBase} from "@shared/base/vo.base";

enum RoomTypeEnum {
    TRIAGE = "TRIAGE",
    TREATMENT = "TREATMENT",
}

export class RoomTypeVo extends VoBase<RoomTypeEnum> {
    public static readonly TRIAGE: RoomTypeVo = new RoomTypeVo(RoomTypeEnum.TRIAGE);
    public static readonly TREATMENT: RoomTypeVo = new RoomTypeVo(RoomTypeEnum.TREATMENT);

    private constructor(value: RoomTypeEnum) {
        super(value);
    }

    static create(value: RoomTypeEnum): RoomTypeVo {
        return new RoomTypeVo(value);
    }

    static fromPersistence(value: string): RoomTypeVo {
        this.assertIn<RoomTypeEnum>(value, Object.values(RoomTypeEnum), "RoomTypeEnum");
        return new RoomTypeVo(value as RoomTypeEnum);
    }

    toString(): string {
        return this.value;
    }
}
