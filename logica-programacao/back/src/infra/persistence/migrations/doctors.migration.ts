import {existsSync} from "node:fs";
import {join} from "node:path";
import {JsonFileStore} from "@infra/persistence/json-file.store";

interface DoctorRecord {
    id: number;
    name: string;
    cpf: string;
    roomId: number;
    status: "WORKING";
}

const DEFAULT_DOCTORS: DoctorRecord[] = [
    {id: 1, name: "ANA MARTINS", cpf: "52998224725", roomId: 1, status: "WORKING"},
    {id: 2, name: "BRUNO ALVES", cpf: "16899535009", roomId: 2, status: "WORKING"},
    {id: 3, name: "CARLA SOUZA", cpf: "11144477735", roomId: 3, status: "WORKING"},
    {id: 4, name: "DANIEL LIMA", cpf: "93541134780", roomId: 4, status: "WORKING"},
    {id: 5, name: "ELISA ROCHA", cpf: "15350946056", roomId: 5, status: "WORKING"},
];

export function migrateDoctors(
    filePath: string = join(process.cwd(), "data", "doctors.json"),
): void {
    // A pre-existing file is treated as user data and must remain untouched.
    if (existsSync(filePath)) {
        return;
    }

    const store = new JsonFileStore<DoctorRecord>(filePath);
    store.replaceAll(DEFAULT_DOCTORS);
}
