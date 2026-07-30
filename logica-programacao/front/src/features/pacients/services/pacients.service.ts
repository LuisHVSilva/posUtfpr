import httpBase from "../../../api/httpBase.api.ts";
import {PatientsUrl} from "../../../api/endpoints.api.ts";
import {assertApiSuccess} from "../../../api/apiResponse.util.ts";
import type {
    PacientsPageData,
    PatientListResponse,
    PatientRecord,
    PatientsSummaryResponse,
    PatientSummary,
    RegisterPatientRequest,
    UpdatePatientRequest
} from "../types/pacients.types";

export class PacientsService {
    async getPageData(): Promise<PacientsPageData> {
        const [summaryResponse, patientsResponse] = await Promise.all([
            httpBase.get(PatientsUrl.summary),
            httpBase.get(PatientsUrl.list),
        ]);
        assertApiSuccess<PatientsSummaryResponse>(summaryResponse.data);
        assertApiSuccess<PatientListResponse>(patientsResponse.data);

        const patients = patientsResponse.data.result.patients.map((patient) =>
            this.toPatientRecord(patient),
        );

        return {
            summary: this.toSummaryCards(summaryResponse.data.result),
            patients,
            registry: patients.map((patient) => ({
                name: patient.name,
                cpf: patient.cpf,
            })),
            pagination: patientsResponse.data.result.pagination,
        };
    }

    async updatePatient(id: number, payload: UpdatePatientRequest): Promise<void> {
        const {data} = await httpBase.patch(PatientsUrl.update(id), payload);
        assertApiSuccess(data);
    }

    async registerPatient(payload: RegisterPatientRequest): Promise<void> {
        const {data} = await httpBase.post(PatientsUrl.list, payload);
        assertApiSuccess(data);
    }

    private toSummaryCards(summary: PatientsSummaryResponse): PatientSummary[] {
        return [
            {label: "Total Registrados", value: summary.totalRecords.toString(), icon: "groups", tone: "primary"},
            {
                label: "Atendimentos Hoje",
                value: summary.attendancesToday.toString(),
                icon: "clinicalNotes",
                tone: "secondary"
            },
            {
                label: "Casos Criticos",
                value: summary.criticalCases.toString().padStart(2, "0"),
                icon: "emergency",
                tone: "danger"
            },
            {label: "Aguardando Triagem", value: summary.waitingTriage.toString(), icon: "triage", tone: "neutral"}
        ];
    }

    private toPatientRecord(patient: PatientListResponse["patients"][number]): PatientRecord {
        return {
            recordId: patient.id,
            id: `#${patient.id.toString().padStart(5, "0")}`,
            name: patient.name,
            cpf: this.formatCpf(patient.cpf),
            birthDate: this.formatDate(patient.birthday),
            birthDateIso: patient.birthday.slice(0, 10),
            initials: this.getInitials(patient.name),
            status: patient.status,
        };
    }

    private formatCpf(cpf: string): string {
        const digits = cpf.replace(/\D/g, "");

        if (digits.length !== 11) {
            return cpf;
        }

        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }

    private formatDate(date: string): string {
        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
        }).format(new Date(date));
    }

    private getInitials(name: string): string {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    }
}

export const pacientsService = new PacientsService();
