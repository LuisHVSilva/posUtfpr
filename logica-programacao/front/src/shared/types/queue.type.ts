export type RegisterQueueRequest = {
    name: string;
    cpf: string;
    birthday: string;
    symptoms: string;
    isEmergency: boolean;
}

export type PatientLookupResult = {
    id: number;
    name: string;
    cpf: string;
    birthday: string;
}

export type FinishTriageRequest = {
    roomId: number;
    priority: string;
}

export type FinishAttendanceRequest = {
    roomId: number;
}
