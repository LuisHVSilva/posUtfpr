import {injectable} from "tsyringe";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";
import {PersistenceBase} from "@shared/base/persistence.base";
import {Rooms} from "@features/entities/rooms";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";

interface RoomRecord {
    id: number;
    name: string;
    isActive: boolean;
    isEmpty: boolean;
    type: string;
}

@injectable()
export class RoomsPersistence implements PersistenceBase<Rooms, RoomRecord> {
    private readonly store: JsonFileStore<RoomRecord>;

    constructor(filePath = join(process.cwd(), "data", "rooms.json")) {
        this.store = new JsonFileStore<RoomRecord>(filePath);
    }

    async save(room: Rooms): Promise<Rooms> {
        const records = this.store.readAll();
        const savedRoom = Rooms.rehydrate({
            ...room.getProps(),
            id: this.store.nextId(records),
        });

        records.push(this.toRecord(savedRoom));
        this.store.replaceAll(records);
        return savedRoom;
    }

    async findByPk(id: number): Promise<Rooms | null> {
        const record = this.store.readAll().find((room) => room.id === id);
        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<Rooms[]> {
        return this.store.readAll().map((record) => this.toEntity(record));
    }

    async update(room: Rooms): Promise<Rooms> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === room.id);
        const updatedRecord = this.toRecord(room);

        records[index] = updatedRecord;
        this.store.replaceAll(records);
        return this.toEntity(updatedRecord);
    }

    async deleteByPk(id: number): Promise<void> {
        const records = this.store.readAll();
        const index = records.findIndex((record) => record.id === id);

        records.splice(index, 1);
        this.store.replaceAll(records);
    }

    toRecord(room: Rooms): RoomRecord {
        return {
            id: room.id!,
            name: room.name,
            isActive: room.isActive,
            isEmpty: room.isEmpty,
            type: room.type.toString(),
        };
    }

    private toEntity(record: RoomRecord): Rooms {
        return Rooms.rehydrate({
            id: record.id,
            name: record.name,
            isActive: record.isActive,
            isEmpty: record.isEmpty,
            type: RoomTypeVo.fromPersistence(record.type),
        });
    }
}
