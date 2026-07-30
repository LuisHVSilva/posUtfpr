import {VoBase} from "@shared/base/vo.base";

enum DoctorStatus {
    WORKING = "WORKING",
    OUT = "OUT",
}

export class DoctorStatusVo extends VoBase<DoctorStatus> {
    public static readonly WORKING: DoctorStatusVo = new DoctorStatusVo(DoctorStatus.WORKING);
    public static readonly OUT: DoctorStatusVo = new DoctorStatusVo(DoctorStatus.OUT);

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

    isWorking(): boolean {
        return this.value === DoctorStatus.WORKING;
    }

    toString(): string {
        return this.value;
    }
}
