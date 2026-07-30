import {existsSync} from "node:fs";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";

interface RoomRecord {
    id: number;
    name: string;
    isActive: boolean;
    isEmpty: boolean;
}

const DEFAULT_ROOMS: RoomRecord[] = [1, 2, 3, 4, 5].map((number) => ({
    id: number,
    name: `A${String(number).padStart(2, "0")}`,
    isActive: true,
    isEmpty: true,
}));

export function migrateRooms(filePath = join(process.cwd(), "data", "rooms.json")): void {
    // A pre-existing file is treated as user data and must remain untouched.
    if (existsSync(filePath)) {
        return;
    }

    const store = new JsonFileStore<RoomRecord>(filePath);
    store.replaceAll(DEFAULT_ROOMS);
}
