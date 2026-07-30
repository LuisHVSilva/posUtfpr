import type {Request, Response} from "express";
import {inject, injectable} from "tsyringe";
import {LoggerController} from "@infra/logger/decorators/loggerController";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {PatientAttendancesService} from "@features/services/patientAttendances.service";
import {ApiResponseUtil} from "@shared/utils/apiResponse.util";
import {StatusCodes} from "http-status-codes";
import {PatientsService} from "@features/services/patients.service";
import {QueueAttendanceService} from "@features/services/queueAttendance.service";
import {QueueEntry} from "@features/entities/queueEntry";


@injectable()
export class QueueController {
    constructor(
        @inject("PatientsService")
        private readonly patientsService: PatientsService,
        @inject("PatientAttendancesService")
        private readonly patientAttendancesService: PatientAttendancesService,
        @inject("QueueAttendanceService")
        private readonly queueAttendanceService: QueueAttendanceService,
    ) {
    }

    @LoggerController()
    async callsDisplay(_req: Request, res: Response): Promise<Response> {
        try {
            const result = await this.queueAttendanceService.getCallsDisplay();

            return ApiResponseUtil.success(res, result, StatusCodes.OK);
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }

    /**
     * Registra a chegada de um paciente na recepção.
     *
     * O controller apenas coordena os serviços das entidades:
     * 1. localiza ou cria o paciente;
     * 2. cria um novo atendimento;
     * 3. coloca esse atendimento na fila correta;
     * 4. a fila tenta ocupar automaticamente uma sala de triagem vazia.
     *
     * Casos emergenciais recebem a prioridade EMERGENCY e são enviados para
     * a fila TREATMENT pelo QueueAttendanceService. Os demais vão para TRIAGE.
     */
    @LoggerController()
    async registerAttendance(req: Request, res: Response): Promise<Response> {
        try {
            const {name, cpf, birthday, symptoms, isEmergency} = req.body as {
                name: string;
                cpf: string;
                birthday: string;
                symptoms: string;
                isEmergency: boolean;
            };

            // Um CPF já cadastrado não gera um segundo Patient; apenas será
            // criado um novo PatientAttendance para ele.
            const patient = await this.patientsService.findOrCreatePatient(
                name,
                birthday,
                cpf,
            );

            const attendance = await this.patientAttendancesService.registerAttendance(
                patient.id!,
                symptoms,
                isEmergency,
            );

            // enqueue também tenta chamar automaticamente uma sala TRIAGE
            // livre. Sem sala disponível, a entrada permanece aguardando.
            const queueEntry: QueueEntry =
                await this.queueAttendanceService.enqueue(attendance);

            // A chamada automática pode ter alterado o status persistido para
            // TRIAGE; buscamos a versão mais recente para responder corretamente.
            const currentAttendance =
                await this.patientAttendancesService.findByPk(attendance.id!);

            return ApiResponseUtil.success(
                res,
                {
                    patient: {
                        id: patient.id,
                        name: patient.name,
                        cpf: patient.cpf.toString(),
                    },
                    attendance: {
                        id: currentAttendance?.id,
                        status: currentAttendance?.status.toString(),
                        priority: currentAttendance?.priority?.toString(),
                    },
                    queue: {
                        type: queueEntry.queueType.toString(),
                        callNumber: queueEntry.callNumber,
                        enteredAt: queueEntry.enteredAt,
                    },
                },
                StatusCodes.CREATED,
            );
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }

    @LoggerController()
    async finishTriage(req: Request, res: Response): Promise<Response> {
        try {
            const roomId: number = Number(req.params.roomId);
            const {priority} = req.body as { priority: string };

            const result = await this.patientAttendancesService.finishTriage(
                roomId,
                PriorityVo.create(priority),
            );

            return ApiResponseUtil.success(res, result, StatusCodes.OK);

        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }

    @LoggerController()
    async finishAttendance(req: Request, res: Response): Promise<Response> {
        try {
            const roomId: number = Number(req.params.roomId);
            const result = await this.patientAttendancesService.finishAttendance(roomId);

            return ApiResponseUtil.success(res, result, StatusCodes.OK);

        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }
}
