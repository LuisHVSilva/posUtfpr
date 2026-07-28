import {VoBase} from "@shared/base/vo.base";

enum DoctorStatus {
    WORKING = "WORKING",
    OUT = "OUT",
    NEW = "NEW",
}

export class DoctorStatusVo extends VoBase<DoctorStatus> {
    public static readonly WORKING: DoctorStatusVo = new DoctorStatusVo(DoctorStatus.WORKING);
    public static readonly OUT: DoctorStatusVo = new DoctorStatusVo(DoctorStatus.OUT);
    public static readonly NEW: DoctorStatusVo = new DoctorStatusVo(DoctorStatus.NEW);

    private constructor(value: DoctorStatus) {
        super(value);
    }

    static create(value: DoctorStatus): DoctorStatusVo {
        return new DoctorStatusVo(value);
    }

    static fromPersistence(value: string): DoctorStatusVo {
        this.assertIn<DoctorStatus>(value, Object.values(DoctorStatus), "doctorStatus");
        return new DoctorStatusVo(value as DoctorStatus);
    }

    toString(): string {
        return this.value;
    }
}
