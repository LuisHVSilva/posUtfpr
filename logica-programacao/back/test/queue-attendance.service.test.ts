import "reflect-metadata";
import {test} from "node:test";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {BusinessRuleError, NotFoundError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientStatusVo} from "@shared/valueObjects/patientStatus.vo";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {activeEntry, attendance, doctor, room} from "./support/domain-builders";
import {services} from "./support/service-factory";
import assert = require("assert");

test("fila chama salas livres automaticamente, ordena atendimento por prioridade e monta painel", async () => {
    const {queueService, queuesRepository, attendancesRepository} = services({
        rooms: [room(1, RoomTypeVo.TRIAGE), room(2, RoomTypeVo.TREATMENT)],
        doctors: [doctor(1, 1), doctor(2, 2)],
    });

    const normalAttendance = await attendancesRepository.save(attendance(0, 1));
    const emergencyAttendance = await attendancesRepository.save(attendance(0, 2, PatientStatusVo.QUEUE, PriorityVo.EMERGENCY));

    const triageTicket = await queueService.enqueue(normalAttendance);
    assert.equal(triageTicket.queueType.toString(), "TRIAGE");
    assert.equal((await attendancesRepository.findByPk(normalAttendance.id!))?.status.toString(), "TRIAGE");

    const treatmentTicket = await queueService.enqueue(emergencyAttendance);
    assert.equal(treatmentTicket.queueType.toString(), "TREATMENT");
    assert.equal((await attendancesRepository.findByPk(emergencyAttendance.id!))?.status.toString(), "TREATMENT");

    const queueSummary = await queueService.getSummary();
    assert.deepEqual(queueSummary, {waitingPatients: 0, emergencies: 1});
    assert.equal((await queueService.getActiveEntries()).length, 2);

    const calls = await queueService.getCallsDisplay();
    assert.equal(calls.alert, "Atencao: prioridade maxima em atendimento");
    assert.equal(calls.panels[0].currentCode, "T-001");
    assert.equal(calls.panels[1].currentCode, "A-001");
    assert.deepEqual(calls.stats.map((stat) => stat.value), ["00 Aguardando", "00 Aguardando", "00 Aguardando"]);

    const treatmentQueue = queuesRepository.items.find((queue) => queue.type.isTreatment())!;
    const low = treatmentQueue.addNewEntry(3, 3, PriorityVo.NOT_URGENT, DateUtil.parse("2026-08-03T07:00:00-03:00"));
    queuesRepository.items[queuesRepository.items.indexOf(treatmentQueue)] = low
        .addNewEntry(4, 4, PriorityVo.VERY_URGENT, DateUtil.parse("2026-08-03T08:00:00-03:00"));

    const next = await queueService.finalizeAttendance(emergencyAttendance.id!);
    assert.equal(next?.attendanceId, 4);
});

test("filas cobrem datas divergentes, salas sem chamada ativa e limites de chamada", async () => {
    const yesterdayQueue = QueueAttendance.rehydrate({
        ...QueueAttendance.create(DateUtil.parse("2026-08-02"), QueueEntryTypeVo.TRIAGE, 5).getProps(),
        id: 1,
    });
    const fullQueue = QueueAttendance.rehydrate({
        ...QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TREATMENT, 1)
            .addNewEntry(2, 2, PriorityVo.URGENT)
            .getProps(),
        id: 2,
        active: [activeEntry(10, 1, 1, QueueEntryTypeVo.TREATMENT)],
    });
    const {queueService, queuesRepository, roomsService} = services({
        queues: [yesterdayQueue, fullQueue],
        attendances: [
            attendance(1, 1, PatientStatusVo.TREATMENT, PriorityVo.EMERGENCY),
            attendance(2, 2, PatientStatusVo.QUEUE, PriorityVo.URGENT),
            attendance(3, 3, PatientStatusVo.QUEUE),
        ],
        rooms: [room(1, RoomTypeVo.TREATMENT, false), room(2, RoomTypeVo.TREATMENT), room(3, RoomTypeVo.TRIAGE)],
        doctors: [doctor(1, 1), doctor(2, 2), doctor(3, 3)],
    });

    const triageTicket = await queueService.enqueue(attendance(3, 3, PatientStatusVo.QUEUE));
    assert.equal(triageTicket.queueType.toString(), "TRIAGE");
    assert.equal(queuesRepository.items.filter((queue) => queue.type.isTriage()).length, 2);

    assert.deepEqual(await queueService.callNextAvailable(QueueEntryTypeVo.TREATMENT), []);
    await assert.rejects(() => queueService.findActiveTriageEntryByRoomId(2), BusinessRuleError);
    await assert.rejects(() => queueService.findActiveTreatmentEntryByRoomId(2), BusinessRuleError);
    await assert.rejects(() => queueService.finalizeTriage(99), NotFoundError);

    const missingRoomServices = services({doctors: [doctor(1, 99)]});
    await assert.rejects(() => missingRoomServices.roomsService.findByDoctorId(1), NotFoundError);

    assert.equal((await roomsService.findByDoctorId(1)).room.id, 1);
});

test("painel apresenta historico, indisponibilidade de sala e contadores de espera", async () => {
    const queueWithWaiting = QueueAttendance.create(DateUtil.today(), QueueEntryTypeVo.TRIAGE, 5)
        .addNewEntry(10, 10, PriorityVo.EMERGENCY)
        .addNewEntry(11, 11, PriorityVo.URGENT)
        .addNewEntry(12, 12);
    const triageQueue = QueueAttendance.rehydrate({
        ...queueWithWaiting.getProps(),
        id: 1,
        nextCallNumber: 6,
        active: [
            activeEntry(4, 1, 1, QueueEntryTypeVo.TRIAGE),
            activeEntry(5, 2, 99, QueueEntryTypeVo.TRIAGE),
        ],
    });
    const {queueService} = services({
        queues: [triageQueue],
        rooms: [room(1, RoomTypeVo.TRIAGE, false)],
        doctors: [doctor(1, 1)],
    });

    const display = await queueService.getCallsDisplay();

    assert.equal(display.panels[0].history.length, 1);
    assert.ok(display.panels[0].history.some((item) => item.room === "Sala indisponivel"));
    assert.deepEqual(display.stats.map((stat) => stat.value), ["01 Aguardando", "01 Aguardando", "01 Aguardando"]);
});
