import {migrateRooms} from "@infra/persistence/migrations/rooms.migration";
import {migrateDoctors} from "@infra/persistence/migrations/doctors.migration";

export const initDb = () => {
    migrateRooms();
    migrateDoctors();
}