import {z} from "zod";
import {ValidationError} from "@shared/errors/application.error";
import {patientFiltersSchema, PatientFilters} from "@features/schemas/patients/patientFilters.schema";

const listPatientsQuerySchema = z.object({
    id: z.coerce.number().int().positive().optional(),
    name: z.string().trim().min(1).optional(),
    cpf: z.string().trim().min(1).optional(),
    birthday: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must use the YYYY-MM-DD format")
        .optional(),
    page: z.coerce.number().int().positive().default(1),
}).transform(({page, ...filters}) => ({
    ...patientFiltersSchema.parse(filters),
    page,
}));

type ListPatientsQuery = PatientFilters & {page: number};

function parseListPatientsQuery(input: unknown): ListPatientsQuery {
    const result = listPatientsQuerySchema.safeParse(input);

    if (!result.success) {
        throw new ValidationError(result.error.issues[0]?.message ?? "Invalid patient filters");
    }

    return result.data;
}

export {parseListPatientsQuery};
export type {ListPatientsQuery};
