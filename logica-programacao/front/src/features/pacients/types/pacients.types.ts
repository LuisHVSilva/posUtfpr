import type {IconName} from "../../../shared/components/Icon/Icon";

export type PatientStatus = "emergency" | "urgent" | "stable";

export type PatientSummary = {
    label: string;
    value: string;
    icon: IconName;
    tone: "primary" | "secondary" | "danger" | "neutral";
};

export type PatientRecord = {
    recordId: number;
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    birthDateIso: string;
    initials: string;
    status: PatientStatus;
};

export type PatientListRecord = {
    name: string;
    cpf: string;
};

export type PacientsPageData = {
    summary: PatientSummary[];
    patients: PatientRecord[];
    registry: PatientListRecord[];
    pagination: PatientsPagination;
};

export type PatientsSummaryResponse = {
    totalRecords: number;
    attendancesToday: number;
    criticalCases: number;
    waitingTriage: number;
};

export type PatientsPagination = {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
};

export type PatientListResponse = {
    patients: Array<{
        id: number;
        name: string;
        cpf: string;
        birthday: string;
        status: PatientStatus;
    }>;
    pagination: PatientsPagination;
};

export type UpdatePatientRequest = {
    name: string;
    cpf: string;
    birthday: string;
};

export type RegisterPatientRequest = {
    name: string;
    cpf: string;
    birthday: string;
};
