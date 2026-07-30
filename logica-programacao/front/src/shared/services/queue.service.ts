import httpBase from "../../api/httpBase.api.ts";
import {PatientsUrl, QueueUrl} from "../../api/endpoints.api.ts";
import type {
    FinishAttendanceRequest,
    FinishTriageRequest,
    PatientLookupResult,
    RegisterQueueRequest
} from "../types/queue.type.ts";
import {assertApiSuccess} from "../../api/apiResponse.util.ts";

type ListPatientsByCpfResponse = {
    patients: Array<{
        id: number;
        name: string;
        cpf: string;
        birthday: string;
    }>;
};


export class QueueService {
    async findPatientByCpf(cpf: string): Promise<PatientLookupResult | null> {
        const digits = cpf.replace(/\D/g, "");
        const {data} = await httpBase.get(PatientsUrl.list, {
            params: {cpf: digits},
        });
        assertApiSuccess<ListPatientsByCpfResponse>(data);

        const patient = data.result.patients[0];

        if (!patient) {
            return null;
        }

        return {
            id: patient.id,
            name: patient.name,
            cpf: patient.cpf,
            birthday: patient.birthday,
        };
    }

    async registerAttendance(payload: RegisterQueueRequest): Promise<void> {
        await httpBase.post(QueueUrl.queue, payload);
    }

    async finishTriage(payload: FinishTriageRequest): Promise<void> {
        const {roomId, priority} = payload;

        await httpBase.patch(QueueUrl.finishTriage(roomId.toString()), {priority});
    }

    async finishAttendance(payload: FinishAttendanceRequest): Promise<void> {
        const {roomId} = payload;

        await httpBase.patch(QueueUrl.finishAttendance(roomId.toString()));
    }
}

export const queueService = new QueueService();
