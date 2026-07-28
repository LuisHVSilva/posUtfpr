import {EntityBase} from "@shared/base/entity.base";
import {ValidationError} from "@shared/errors/application.error";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {DoctorStatusVo} from "@shared/valueObjects/doctorStatus.vo";

export interface DoctorProps {
    id?: number;
    name: string;
    cpf: CpfVo;
    room: string;
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

    get room(): string {
        return this.props.room;
    }

    get cpf(): CpfVo {
        return this.props.cpf;
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

    private validateRoom(): void {
        const sanitizedName: string = this.props.room.trim();
        const sanitizedRoomLength: number = sanitizedName.length;

        if (sanitizedRoomLength < 0) {
            throw new ValidationError(`Room name can't be empty`);
        }
    }


    private validations(): void {
        this.validateName();
        this.validateRoom();
    }

    static create(name: string, cpf: string, room: string): Doctor {
        const cpfVo: CpfVo = CpfVo.createCpf(cpf);
        const sanitizedName: string = name.trim().toUpperCase();

        return new Doctor({
            name: sanitizedName,
            cpf: cpfVo,
            status: DoctorStatusVo.NEW,
            room: room.toString().toUpperCase()
        });
    }

    work(): this {
        return this.cloneWith({status: DoctorStatusVo.WORKING});
    }

    out(): this {
        return this.cloneWith({status: DoctorStatusVo.OUT});
    }

    changeRoom(newRoom: string): this {
        return this.cloneWith({room: newRoom});
    }
}
