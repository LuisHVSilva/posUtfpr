import {EntityBase} from "@shared/base/entity.base";
import {ValidationError} from "@shared/errors/application.error";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {DoctorStatusVo} from "@shared/valueObjects/doctorStatus.vo";

export interface DoctorProps {
    id?: number;
    name: string;
    cpf: CpfVo;
    roomId?: number;
    status: DoctorStatusVo
}

export class Doctor extends EntityBase<DoctorProps> {
    private static readonly MIN_NAME_LENGTH = 4;
    private static readonly MAX_NAME_LENGTH = 100;

    constructor(props: DoctorProps) {
        super(props);
        this.validations();
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get roomId(): number | undefined {
        return this.props.roomId;
    }

    get cpf(): CpfVo {
        return this.props.cpf;
    }

    get status(): DoctorStatusVo {
        return this.props.status;
    }

    private validateName(): void {
        const sanitizedName: string = this.props.name.trim();
        const sanitizedNameLength: number = sanitizedName.length;

        if (sanitizedNameLength < Doctor.MIN_NAME_LENGTH) {
            throw new ValidationError(`Patient name must have at least ${Doctor.MIN_NAME_LENGTH} characters`);
        }

        if (sanitizedNameLength > Doctor.MAX_NAME_LENGTH) {
            throw new ValidationError(`Patient name must not have more than ${Doctor.MAX_NAME_LENGTH} characters`);
        }
    }

    private validations(): void {
        this.validateName();
    }

    startWorking(roomId: number): this {
        return this.cloneWith({
            status: DoctorStatusVo.WORKING,
            roomId
        });
    }

    stopWorking(): this {
        return this.cloneWith({
            status: DoctorStatusVo.OUT,
            roomId: undefined
        });
    }

    changeRoom(roomId: number): this {
        if (!this.status.isWorking()) {
            throw new ValidationError(`Can't change room for doctor in ${this.status.toString()} status`);
        }

        return this.cloneWith({roomId});
    }
}
