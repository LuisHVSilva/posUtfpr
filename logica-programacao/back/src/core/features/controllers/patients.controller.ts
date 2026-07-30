import {inject, injectable} from "tsyringe";
import type {Request, Response} from "express";
import {ApiResponseUtil} from "@shared/utils/apiResponse.util";
import {StatusCodes} from "http-status-codes";
import {PatientsService} from "@features/services/patients.service";
import {LoggerController} from "@infra/logger/decorators/loggerController";
import {Patients} from "@features/entities/patients";
import {parseListPatientsQuery} from "@features/schemas/patients/listPatientsQuery.schema";


@injectable()
export class PatientsController {
    constructor(
        @inject("PatientsService")
        private readonly patientsService: PatientsService,
    ) {
    }

    @LoggerController()
    async updatePatient(req: Request, res: Response): Promise<Response> {
        try {
            const {name, cpf, birthday} = req.body as {
                name?: string;
                cpf?: string;
                birthday?: string;
            };

            const id: number = Number(req.params.id);

            const patient: Patients = await this.patientsService.updateRegistration(
                id,
                name,
                cpf,
                birthday,
            );

            return ApiResponseUtil.success(
                res,
                {
                    id: patient.id,
                    name: patient.name,
                    cpf: patient.cpf.toString(),
                    birthday: patient.birthday,
                },
                StatusCodes.OK,
            );
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }

    @LoggerController()
    async listPatients(req: Request, res: Response): Promise<Response> {
        try {
            const filters = parseListPatientsQuery(req.query);
            const result = await this.patientsService.listPatients(filters);

            return ApiResponseUtil.success(
                res,
                {
                    patients: result.patients.map((patient) => ({
                        id: patient.id,
                        name: patient.name,
                        cpf: patient.cpf.toString(),
                        birthday: patient.birthday,
                    })),
                    pagination: result.pagination,
                },
                StatusCodes.OK,
            );
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }
}
