import {inject, injectable} from "tsyringe";
import {BusinessRuleError, NotFoundError} from "@shared/errors/application.error";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";
import {Rooms} from "@features/entities/rooms";
import {Doctor} from "@features/entities/doctor";
import {DoctorsPersistence} from "@features/persistences/doctors.persistence";
import {RoomsPersistence} from "@features/persistences/rooms.persistence";

@injectable()
export class RoomsService {
    constructor(
        @inject("RoomsPersistence")
        private readonly roomsPersistence: RoomsPersistence,
        @inject("DoctorsPersistence")
        private readonly doctorsPersistence: DoctorsPersistence,
    ) {
    }

    async findByDoctorId(doctorId: number): Promise<{room: Rooms; doctor: Doctor}> {
        const doctor = await this.doctorsPersistence.findByPk(doctorId);

        if (!doctor || !doctor.roomId || !doctor.status.isWorking()) {
            throw new BusinessRuleError("Doctor is not assigned to an active room");
        }

        const room = await this.roomsPersistence.findByPk(doctor.roomId);

        if (!room) {
            throw new NotFoundError(`Room ${doctor.roomId} does not exist`);
        }

        return {room, doctor};
    }

    async findAvailable(type: RoomTypeVo): Promise<Array<{room: Rooms; doctor: Doctor}>> {
        const rooms = await this.roomsPersistence.findAll();
        const doctors = await this.doctorsPersistence.findAll();

        return rooms
            .filter((room) =>
                room.type.toString() === type.toString() &&
                room.isActive &&
                room.isEmpty,
            )
            .map((room) => {
                const doctor = doctors.find((candidate) =>
                    candidate.roomId === room.id && candidate.status.isWorking(),
                );

                return doctor ? {room, doctor} : undefined;
            })
            .filter((item): item is {room: Rooms; doctor: Doctor} => item !== undefined);
    }

    async clear(room: Rooms): Promise<Rooms> {
        return this.roomsPersistence.update(room.clear());
    }

    async populate(room: Rooms): Promise<Rooms> {
        return this.roomsPersistence.update(room.populate());
    }
}
