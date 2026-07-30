import {EntityBase} from "@shared/base/entity.base";
import {ValidationError} from "@shared/errors/application.error";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";

export interface RoomsProps {
    id?: number;
    name: string;
    isActive: boolean;
    isEmpty: boolean;
    type: RoomTypeVo;
}

export class Rooms extends EntityBase<RoomsProps> {
    private static MIN_NAME_LENGTH: number = 2;
    private static MAX_NAME_LENGTH: number = 4;

    constructor(props: RoomsProps) {
        super(props);
        this.validations();
    }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get isEmpty(): boolean {
        return this.props.isEmpty;
    }

    get type(): RoomTypeVo {
        return this.props.type;
    }

    private validateName(): void {
        const sanitizedName = this.props.name.trim();
        const sanitizedNameLength = sanitizedName.length;

        if (sanitizedNameLength < Rooms.MIN_NAME_LENGTH) {
            throw new ValidationError(
                `Rooms name must have at least ${Rooms.MIN_NAME_LENGTH} characters`,
            );
        }

        if (sanitizedNameLength > Rooms.MAX_NAME_LENGTH) {
            throw new ValidationError(
                `Rooms name must not have more than ${Rooms.MAX_NAME_LENGTH} characters`,
            );
        }
    }

    private validations(): void {
        this.validateName();
    }

    activate(): this {
        return this.cloneWith({isActive: true});
    }

    deactivate(): this {
        if (!this.isEmpty) {
            throw new ValidationError("Can't deactivate rooms that is not empty");
        }

        return this.cloneWith({isActive: false});
    }

    clear(): this {
        return this.cloneWith({isEmpty: true});
    }

    populate(): this {
        if (!this.isActive) {
            throw new ValidationError("Can't populate rooms that is not active");
        }

        return this.cloneWith({isEmpty: false});
    }
}
