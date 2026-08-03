import "reflect-metadata";
import {test} from "node:test";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {Rooms} from "@features/entities/rooms";
import {BusinessRuleError, NotFoundError, ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";
import {PatientStatusVo} from "@shared/valueObjects/patientStatus.vo";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";
import {QueueAttendance} from "@features/entities/queueAttendance";
import {attendance, doctor, OTHER_CPF, patient, room, VALID_CPF} from "./support/domain-builders";
import {services} from "./support/service-factory";
import assert = require("assert");

test("cadastro de paciente normaliza dados, rejeita CPF duplicado e reutiliza cadastro na recepcao", async () => {
    const {patientsService, patientsRepository} = services();

    const created = await patientsService.registerPatients("  Ana Maria  ", "1991-02-03", VALID_CPF);

    assert.equal(created.id, 1);
    assert.equal(created.name, "ANA MARIA");
    assert.equal(created.cpf.toString(), VALID_CPF);
    await assert.rejects(
        () => patientsService.registerPatients("Ana Maria", "1991-02-03", VALID_CPF),
        BusinessRuleError,
    );

    assert.equal(await patientsService.findOrCreatePatient("Outro Nome", "1980-01-01", VALID_CPF), created);
    const second = await patientsService.findOrCreatePatient("Bruno Lima", "1988-09-10", OTHER_CPF);

    assert.equal(second.id, 2);
    assert.equal(patientsRepository.items.length, 2);
});

test("atualizacao e consultas de pacientes validam regras e calculam status da listagem", async () => {
    const today = DateUtil.today();
    const emergency = attendance(1, 1, PatientStatusVo.TREATMENT, PriorityVo.EMERGENCY, today);
    const urgent = attendance(2, 2, PatientStatusVo.TRIAGE, PriorityVo.URGENT, today);
    const olderStable = attendance(4, 1, PatientStatusVo.TRIAGE, PriorityVo.NOT_URGENT, DateUtil.parse("2026-08-02T10:00:00-03:00"));
    const completed = PatientAttendances.rehydrate({
        ...attendance(3, 3, PatientStatusVo.COMPLETED, PriorityVo.NOT_URGENT, today).getProps(),
        treatmentStartedAt: DateUtil.parse("2026-08-03T08:00:00-03:00"),
        treatmentFinishedAt: DateUtil.parse("2026-08-03T09:00:00-03:00"),
    });
    const triageQueue = QueueAttendance.create(today, QueueEntryTypeVo.TRIAGE, 5)
        .addNewEntry(10, 1)
        .addNewEntry(11, 2);
    const {patientsService} = services({
        patients: [
            patient(1, "ANA MARIA", VALID_CPF),
            patient(2, "BRUNO LIMA", OTHER_CPF),
            patient(3, "CARLA DIAS", "11144477735"),
        ],
        attendances: [olderStable, emergency, urgent, completed],
        queues: [triageQueue],
    });

    await assert.rejects(() => patientsService.updateRegistration(0), ValidationError);
    await assert.rejects(() => patientsService.updateRegistration(99, "Nao existe"), NotFoundError);
    await assert.rejects(() => patientsService.updateRegistration(1, undefined, OTHER_CPF), BusinessRuleError);

    const updated = await patientsService.updateRegistration(1, "Ana Paula", VALID_CPF, "1992-04-05");
    assert.equal(updated.name, "ANA PAULA");
    assert.equal(updated.birthday.toISOString().slice(0, 10), "1992-04-05");

    const list = await patientsService.listPatients({page: 1, name: "a"});
    assert.deepEqual(
        list.patients.map((item) => item.status),
        ["emergency", "urgent", "stable"],
    );
    assert.equal(list.pagination.totalItems, 3);

    const filtered = await patientsService.listPatients({page: 1, cpf: OTHER_CPF});
    assert.equal(filtered.patients[0].patient.name, "BRUNO LIMA");

    const summary = await patientsService.getSummary();
    assert.equal(summary.totalRecords, 3);
    assert.equal(summary.attendancesToday, 3);
    assert.equal(summary.criticalCases, 1);
    assert.equal(summary.waitingTriage, 2);
});

test("consultas cobrem filtros opcionais e caminhos sem dados ativos", async () => {
    const {patientsService, roomsService, queueService} = services({
        patients: [patient(1, "ANA MARIA", VALID_CPF)],
        rooms: [
            room(1, RoomTypeVo.TRIAGE),
            Rooms.rehydrate({id: 2, name: "S2", isActive: false, isEmpty: true, type: RoomTypeVo.TREATMENT}),
            room(3, RoomTypeVo.TREATMENT),
        ],
        doctors: [doctor(1, 1)],
    });

    assert.equal((await patientsService.findByPk(1))?.name, "ANA MARIA");
    assert.equal(await patientsService.findByPk(99), null);

    const byIdAndBirthday = await patientsService.listPatients({
        page: 1,
        id: 1,
        birthday: "1990-01-01",
    });
    assert.equal(byIdAndBirthday.pagination.totalPages, 1);
    assert.equal(byIdAndBirthday.patients[0].status, "stable");

    const noMatches = await patientsService.listPatients({page: 2, name: "inexistente"});
    assert.equal(noMatches.pagination.totalPages, 0);
    assert.equal(noMatches.patients.length, 0);

    const roomsSummary = await roomsService.findActives();
    assert.equal(roomsSummary.totalActives, 2);
    assert.equal(roomsSummary.totalInactives, 1);
    assert.equal((await roomsService.findAvailable(RoomTypeVo.TREATMENT)).length, 0);
    await assert.rejects(() => roomsService.findByDoctorId(99), BusinessRuleError);
    await assert.rejects(() => roomsService.findByRoomId(3), BusinessRuleError);

    assert.deepEqual(await queueService.callNextAvailable(QueueEntryTypeVo.TREATMENT), []);
    const display = await queueService.getCallsDisplay();
    assert.equal(display.alert, "Painel de chamadas atualizado");
    assert.equal(display.panels[0].currentCode, "--");
    assert.equal(display.panels[0].currentRoom, "Sem chamada ativa");
});
