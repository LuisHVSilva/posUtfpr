import type {IconName} from "../../../shared/components/Icon/Icon";

export type PatientStatus = "emergency" | "urgent" | "stable";

export type PatientSummary = {
    label: string;
    value: string;
    icon: IconName;
    tone: "primary" | "secondary" | "danger" | "neutral";
};

export type PatientRecord = {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
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
};
