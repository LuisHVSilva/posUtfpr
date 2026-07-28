import {EntityBase} from "@shared/base/entity.base";
import {ValidationError} from "@shared/errors/application.error";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {DateUtil} from "@shared/utils/date.util";

export interface PatientsProps {
    id?: number;
    name: string;
    birthday: Date;
    cpf: CpfVo;
}

export class Patients extends EntityBase<PatientsProps> {
    private static readonly MIN_NAME_LENGTH = 4;
    private static readonly MAX_NAME_LENGTH = 100;
    private static readonly MAX_AGE = 120;

    constructor(props: PatientsProps) {
        super(props);
        this.validations();
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get birthday(): Date {
        return this.props.birthday;
    }

    get cpf(): CpfVo {
        return this.props.cpf;
    }

    private validateName(): void {
        const sanitizedName = this.props.name.trim();
        const sanitizedNameLength = sanitizedName.length;

        if (sanitizedNameLength < Patients.MIN_NAME_LENGTH) {
            throw new ValidationError(
                `Patient name must have at least ${Patients.MIN_NAME_LENGTH} characters`,
            );
        }

        if (sanitizedNameLength > Patients.MAX_NAME_LENGTH) {
            throw new ValidationError(
                `Patient name must not have more than ${Patients.MAX_NAME_LENGTH} characters`,
            );
        }
    }

    private validateBirthday(): void {
        const birthday = DateUtil.parse(this.props.birthday);

        if (Number.isNaN(birthday.getTime())) {
            throw new ValidationError("Birthday must be a valid date");
        }

        const today = DateUtil.today();
        today.setHours(0, 0, 0, 0);
        birthday.setHours(0, 0, 0, 0);

        if (birthday > today) {
            throw new ValidationError("Birthday cannot be in the future");
        }

        const oldestAllowedBirthday = DateUtil.parse(today);
        oldestAllowedBirthday.setFullYear(
            oldestAllowedBirthday.getFullYear() - Patients.MAX_AGE,
        );

        if (birthday < oldestAllowedBirthday) {
            throw new ValidationError(
                `Patient must not be older than ${Patients.MAX_AGE} years`,
            );
        }
    }

    private validations(): void {
        this.validateName();
        this.validateBirthday();
    }

    static create(name: string, birthday: Date, cpf: string): Patients {
        const cpfVo: CpfVo = CpfVo.createCpf(cpf);
        const sanitizedName: string = name.trim().toUpperCase();

        return new Patients({name: sanitizedName, birthday, cpf: cpfVo});
    }

    updateCpf(cpf: CpfVo): this {
        return this.cloneWith({cpf});
    }

    updateName(name: string): this {
        return this.cloneWith({name: name.trim().toUpperCase()})
    }

    updateBirthday(birthday: Date): this {
        return this.cloneWith({birthday});
    }
}
