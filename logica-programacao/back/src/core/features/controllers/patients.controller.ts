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
    async registerPatient(req: Request, res: Response): Promise<Response> {
        try {
            const {name, cpf, birthday} = req.body as {
                name: string;
                cpf: string;
                birthday: string;
            };

            const patient: Patients = await this.patientsService.registerPatients(
                name,
                birthday,
                cpf,
            );

            return ApiResponseUtil.success(
                res,
                {
                    id: patient.id,
                    name: patient.name,
                    cpf: patient.cpf.toString(),
                    birthday: patient.birthday,
                },
                StatusCodes.CREATED,
            );
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
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
    async summary(_req: Request, res: Response): Promise<Response> {
        try {
            const result = await this.patientsService.getSummary();

            return ApiResponseUtil.success(res, result, StatusCodes.OK);
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
                    patients: result.patients.map(({patient, status}) => ({
                        id: patient.id,
                        name: patient.name,
                        cpf: patient.cpf.toString(),
                        birthday: patient.birthday,
                        status,
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
