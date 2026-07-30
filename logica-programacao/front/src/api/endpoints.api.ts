const rooms = "rooms";
const queue = "queue";
const metadata = "metadata";
const patients = "patients";

export const RoomsUrl = {
    summary: `/${rooms}/summary`,
}

export const QueueUrl = {
    queue: `/${queue}/attendance`,
    calls: `/${queue}/calls`,
    finishTriage: (roomId: string) => `/${queue}/triage/${roomId}/finish`,
    finishAttendance: (roomId: string) => `/${queue}/attendance/${roomId}/finish`,
}

export const MetadataUrl = {
    priorities: `/${metadata}/priorities`,
}

export const PatientsUrl = {
    list: `/${patients}`,
    summary: `/${patients}/summary`,
    update: (id: number) => `/${patients}/${id}`,
}
