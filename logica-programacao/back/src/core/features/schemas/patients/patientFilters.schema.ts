import {z} from "zod";

/** Filtros normalizados, reutilizáveis por qualquer consulta de pacientes. */
const patientFiltersSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string().trim().min(1).optional(),
    cpf: z.string().trim().min(1).optional(),
    birthday: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must use the YYYY-MM-DD format")
        .optional(),
});

type PatientFilters = z.infer<typeof patientFiltersSchema>;

export {patientFiltersSchema};
export type {PatientFilters};
