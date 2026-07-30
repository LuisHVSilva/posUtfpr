import type {CallsPageData} from "../types/calls.types";

const mockedCallsPageData: CallsPageData = {
    display: {
        alert: "Atencao: Prioridade Maxima na Sala 04",
        systemStatus: "Sistema Ativo",
        panels: [
            {
                title: "Triagem",
                currentCode: "T-142",
                currentRoom: "Sala 02",
                tone: "triage",
                history: [
                    {code: "T-141", room: "Sala 01"},
                    {code: "T-140", room: "Sala 03"},
                    {code: "T-139", room: "Sala 02"}
                ]
            },
            {
                title: "Atendimento",
                currentCode: "A-087",
                currentRoom: "Consultorio 05",
                tone: "attendance",
                history: [
                    {code: "A-086", room: "Cons. 02"},
                    {code: "A-085", room: "Cons. 08"},
                    {code: "A-084", room: "Cons. 01"}
                ]
            }
        ],
        stats: [
            {label: "Emergencia", value: "02 Aguardando", tone: "emergency"},
            {label: "Muito Urgente", value: "05 Aguardando", tone: "urgent"},
            {label: "Pouco Urgente", value: "12 Aguardando", tone: "stable"}
        ]
    }
};

export class CallsService {
    async getPageData(): Promise<CallsPageData> {
        // TODO: substituir pelo endpoint da feature quando a API estiver disponivel.
        return mockedCallsPageData;
    }
}

export const callsService = new CallsService();
