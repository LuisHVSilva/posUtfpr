import type {Request, Response} from "express";
import {inject, injectable} from "tsyringe";
import {LoggerController} from "@infra/logger/decorators/loggerController";
import {ApiResponseUtil} from "@shared/utils/apiResponse.util";
import {StatusCodes} from "http-status-codes";
import {RoomsService} from "@features/services/rooms.service";
import {QueueAttendanceService} from "@features/services/queueAttendance.service";
import {PatientAttendancesService} from "@features/services/patientAttendances.service";
import {PatientsService} from "@features/services/patients.service";
import {Rooms} from "@features/entities/rooms";
import {ActiveQueueEntry} from "@features/entities/activeQueueEntry";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";


@injectable()
export class RoomsController {
    constructor(
        @inject("RoomsService")
        private readonly roomsService: RoomsService,
        @inject("QueueAttendanceService")
        private readonly queueAttendanceService: QueueAttendanceService,
        @inject("PatientAttendancesService")
        private readonly patientAttendancesService: PatientAttendancesService,
        @inject("PatientsService")
        private readonly patientsService: PatientsService,
    ) {
    }

    @LoggerController()
    async summary(_req: Request, res: Response): Promise<Response> {
        try {
            const [{rooms, totalActives}, queueSummary, averageWait, activeEntries] = await Promise.all([
                this.roomsService.findActives(),
                this.queueAttendanceService.getSummary(),
                this.patientAttendancesService.getAverageWait(),
                this.queueAttendanceService.getActiveEntries(),
            ]);

            const roomsInfo = await Promise.all(rooms.map(async (room: Rooms) => {
                const activeEntry = await this.findActiveEntryForRoom(room, activeEntries);
                const attendance = activeEntry
                    ? await this.patientAttendancesService.findByPk(activeEntry.attendanceId)
                    : null;
                const patient = attendance
                    ? await this.patientsService.findByPk(attendance.patientId)
                    : null;

                return {
                    id: room.id!,
                    name: room.name,
                    specialty: room.type.toString() === RoomTypeVo.TRIAGE.toString()
                        ? "Triagem"
                        : "Atendimento",
                    queueType: room.type.toString(),
                    status: !room.isActive
                        ? "closed"
                        : attendance?.priority?.isEmergency()
                            ? "emergency"
                            : "active",
                    ...(activeEntry && {ticket: `${activeEntry.queueType.isTreatment() ? "E" : "T"}-${String(activeEntry.callNumber).padStart(3, "0")}`}),
                    ...(patient && {patient: patient.name}),
                };
            }));

            const result = {
                activeRooms: totalActives,
                waitingPatients: queueSummary.waitingPatients,
                averageWait,
                emergencies: queueSummary.emergencies,
                rooms: roomsInfo,
            };


            return ApiResponseUtil.success(res, result, StatusCodes.OK);
        } catch (error) {
            return ApiResponseUtil.handleResultError(res, error);
        }
    }

    private async findActiveEntryForRoom(room: Rooms, activeEntries: ActiveQueueEntry[]): Promise<ActiveQueueEntry | undefined> {
        for (const entry of activeEntries) {
            const assignment = await this.roomsService.findByDoctorId(entry.doctorId);

            if (assignment.room.id === room.id) {
                return entry;
            }
        }

        return undefined;
    }

}
