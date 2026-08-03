import "reflect-metadata";
import {test} from "node:test";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {PatientAttendancesPersistence} from "@features/persistences/patientAttendances.persistence";
import {PatientAttendancesService} from "@features/services/patientAttendances.service";
import {QueueAttendanceService} from "@features/services/queueAttendance.service";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {BusinessRuleError, NotFoundError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientStatusVo} from "@shared/valueObjects/patientStatus.vo";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {activeEntry, attendance, doctor, room} from "./support/domain-builders";
import {MemoryAttendancesRepository} from "./support/in-memory-repositories";
import {services} from "./support/service-factory";
import assert = require("assert");

test("registro de atendimento bloqueia paciente em tratamento e calcula media apenas dos finalizados", async () => {
    const completedAttendance = attendance(
        1,
        1,
        PatientStatusVo.COMPLETED,
        PriorityVo.LESS_URGENT,
        DateUtil.parse("2026-08-03T08:00:00-03:00"),
    );
    const persistedCompleted = PatientAttendances.rehydrate({
        ...completedAttendance.getProps(),
        treatmentStartedAt: DateUtil.parse("2026-08-03T08:30:00-03:00"),
        treatmentFinishedAt: DateUtil.parse("2026-08-03T09:30:00-03:00"),
    });
    const {attendancesService, attendancesRepository} = services({attendances: [persistedCompleted]});

    assert.equal((await attendancesService.findByPk(1))?.patientId, 1);
    assert.equal(await attendancesService.findByPk(99), null);
    assert.equal(await attendancesService.getAverageWait(), "90 min");
    const created = await attendancesService.registerAttendance(2, "Dor toracica", true);
    assert.equal(created.priority?.toString(), "EMERGENCY");
    assert.equal(created.status.toString(), "QUEUE");
    await assert.rejects(() => attendancesService.registerAttendance(2, "Retorno", false), BusinessRuleError);

    attendancesRepository.items = [];
    assert.equal(await attendancesService.getAverageWait(), "0 min");
});

test("finalizacao de triagem atualiza prioridade, reencaminha atendimento e chama proximo paciente", async () => {
    const first = attendance(1, 1, PatientStatusVo.TRIAGE);
    const second = attendance(2, 2, PatientStatusVo.QUEUE);
    const queue = QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TRIAGE, 5)
        .addNewEntry(1, 1)
        .addNewEntry(2, 2)
        .callNext(1);
    const {attendancesService, attendancesRepository, queuesRepository} = services({
        attendances: [first, second],
        queues: [QueueAttendance.rehydrate({...queue.getProps(), id: 1})],
        rooms: [room(1, RoomTypeVo.TRIAGE), room(2, RoomTypeVo.TREATMENT)],
        doctors: [doctor(1, 1), doctor(2, 2)],
    });

    const result = await attendancesService.finishTriage(1, PriorityVo.VERY_URGENT);

    assert.equal(result.attendance.priority?.toString(), "VERY_URGENT");
    assert.equal(result.attendance.status.toString(), "TREATMENT");
    assert.equal(result.nextPatient?.attendanceId, 2);
    assert.equal((await attendancesRepository.findByPk(2))?.status.toString(), "TRIAGE");
    assert.ok(queuesRepository.items.some((item) => item.type.isTreatment()));
});

test("servicos sinalizam inconsistencias de sala e fila nos fluxos assincronos", async () => {
    const treatmentActive = activeEntry(1, 1, 1, QueueEntryTypeVo.TREATMENT);
    const treatmentQueue = QueueAttendance.rehydrate({
        ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TREATMENT, 5).getProps(),
        id: 1,
        active: [treatmentActive],
        nextCallNumber: 2,
    });
    const {queueService, roomsService, attendancesService} = services({
        attendances: [attendance(1, 1, PatientStatusVo.TRIAGE)],
        queues: [treatmentQueue],
        rooms: [room(1, RoomTypeVo.TRIAGE)],
        doctors: [doctor(1, 1)],
    });

    await assert.rejects(() => queueService.findActiveTriageEntryByRoomId(2), NotFoundError);
    await assert.rejects(() => queueService.findActiveTreatmentEntryByRoomId(1), BusinessRuleError);
    await assert.rejects(() => queueService.findActiveTriageEntryByRoomId(1), BusinessRuleError);
    await assert.rejects(() => queueService.finalizeTriage(1), BusinessRuleError);
    await assert.rejects(() => queueService.finalizeAttendance(99), NotFoundError);
    await assert.rejects(() => roomsService.findByRoomId(99), NotFoundError);
    await assert.rejects(() => attendancesService.finishAttendance(1), BusinessRuleError);
});

test("finalizacao de atendimento cobre sucesso, atendimento ausente e salas invalidas", async () => {
    const treatmentQueue = QueueAttendance.rehydrate({
        ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TREATMENT, 5).getProps(),
        id: 1,
        active: [activeEntry(1, 1, 1, QueueEntryTypeVo.TREATMENT)],
        nextCallNumber: 2,
    });
    const {attendancesService, attendancesRepository, queueService} = services({
        attendances: [attendance(1, 1, PatientStatusVo.TREATMENT, PriorityVo.LESS_URGENT)],
        queues: [treatmentQueue],
        rooms: [room(1, RoomTypeVo.TREATMENT, false)],
        doctors: [doctor(1, 1)],
    });

    const finished = await attendancesService.finishAttendance(1);
    assert.equal(finished.attendance.status.toString(), "COMPLETED");
    assert.equal(finished.nextPatient, null);
    assert.equal((await attendancesRepository.findByPk(1))?.status.toString(), "COMPLETED");

    const fakeQueue = {
        findActiveTriageEntryByRoomId: async () => activeEntry(99, 1, 1, QueueEntryTypeVo.TRIAGE),
        finalizeTriage: async () => null,
        enqueue: async () => null,
        findActiveTreatmentEntryByRoomId: async () => activeEntry(99, 1, 1, QueueEntryTypeVo.TREATMENT),
        finalizeAttendance: async () => null,
    };
    const emptyAttendanceService = new PatientAttendancesService(
        new MemoryAttendancesRepository() as unknown as PatientAttendancesPersistence,
        fakeQueue as unknown as QueueAttendanceService,
    );
    await assert.rejects(() => emptyAttendanceService.finishTriage(1, PriorityVo.URGENT), NotFoundError);
    await assert.rejects(() => emptyAttendanceService.finishAttendance(1), NotFoundError);

    const fallbackRepo = new MemoryAttendancesRepository([attendance(7, 7, PatientStatusVo.TRIAGE)]);
    fallbackRepo.findByPk = async (id: number) =>
        fallbackRepo.items.find((item) => item.id === id && !item.priority) ?? null;
    const fallbackQueue = {
        findActiveTriageEntryByRoomId: async () => activeEntry(7, 7, 1, QueueEntryTypeVo.TRIAGE),
        finalizeTriage: async () => null,
        enqueue: async () => null,
    };
    const fallbackService = new PatientAttendancesService(
        fallbackRepo as unknown as PatientAttendancesPersistence,
        fallbackQueue as unknown as QueueAttendanceService,
    );
    const fallbackResult = await fallbackService.finishTriage(1, PriorityVo.URGENT);
    assert.equal(fallbackResult.attendance.priority?.toString(), "URGENT");

    const activeWaitingTriageQueue = QueueAttendance.rehydrate({
        ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TRIAGE, 5).getProps(),
        id: 2,
        waiting: [QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TRIAGE, 5).addNewEntry(2, 2).waiting[0]],
    });
    const noActiveTriage = services({
        queues: [activeWaitingTriageQueue],
        rooms: [room(1, RoomTypeVo.TRIAGE)],
        doctors: [doctor(1, 1)],
    });
    await assert.rejects(() => noActiveTriage.queueService.finalizeTriage(2), BusinessRuleError);

    const wrongQueueTypeForAttendance = services({
        queues: [QueueAttendance.rehydrate({
            ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TRIAGE, 5).getProps(),
            id: 5,
            active: [activeEntry(5, 5, 1, QueueEntryTypeVo.TRIAGE)],
        })],
        rooms: [room(1, RoomTypeVo.TRIAGE, false)],
        doctors: [doctor(1, 1)],
    });
    await assert.rejects(() => wrongQueueTypeForAttendance.queueService.finalizeAttendance(5), BusinessRuleError);

    const waitingOnlyTreatment = services({
        queues: [QueueAttendance.rehydrate({
            ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TREATMENT, 5)
                .addNewEntry(6, 6, PriorityVo.URGENT)
                .getProps(),
            id: 6,
        })],
        rooms: [room(1, RoomTypeVo.TREATMENT)],
        doctors: [doctor(1, 1)],
    });
    await assert.rejects(() => waitingOnlyTreatment.queueService.finalizeAttendance(6), BusinessRuleError);

    const wrongRoomTreatment = services({
        queues: [QueueAttendance.rehydrate({...treatmentQueue.getProps(), id: 3})],
        rooms: [room(1, RoomTypeVo.TRIAGE, false)],
        doctors: [doctor(1, 1)],
    });
    await assert.rejects(() => wrongRoomTreatment.queueService.finalizeAttendance(1), BusinessRuleError);

    const wrongRoomTriage = services({
        queues: [QueueAttendance.rehydrate({
            ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TRIAGE, 5).getProps(),
            id: 4,
            active: [activeEntry(3, 3, 1, QueueEntryTypeVo.TRIAGE)],
        })],
        rooms: [room(1, RoomTypeVo.TREATMENT, false)],
        doctors: [doctor(1, 1)],
    });
    await assert.rejects(() => wrongRoomTriage.queueService.finalizeTriage(3), BusinessRuleError);

    await assert.rejects(() => queueService.finalizeAttendance(1), NotFoundError);
});
