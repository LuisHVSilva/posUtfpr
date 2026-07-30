import {existsSync} from "node:fs";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";

interface RoomRecord {
    id: number;
    name: string;
    isActive: boolean;
    isEmpty: boolean;
    type: "TRIAGE" | "TREATMENT";
}

const DEFAULT_ROOMS: RoomRecord[] = [1, 2, 3, 4, 5].map((number) => ({
    id: number,
    name: `A${String(number).padStart(2, "0")}`,
    isActive: true,
    isEmpty: true,
    type: number <= 2 ? "TRIAGE" : "TREATMENT",
}));

export function migrateRooms(filePath: string = join(process.cwd(), "data", "rooms.json")): void {
    if (existsSync(filePath)) {
        return;
    }

    const store = new JsonFileStore<RoomRecord>(filePath);
    store.replaceAll(DEFAULT_ROOMS);
}
