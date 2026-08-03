import {ActiveQueueEntry} from "@features/entities/activeQueueEntry";
import {Doctor} from "@features/entities/doctor";
import {PatientAttendances} from "@features/entities/patientAttendances";
import {Patients} from "@features/entities/patients";
import {Rooms} from "@features/entities/rooms";
import {DateUtil} from "@shared/utils/date.util";
import {CpfVo} from "@shared/valueObjects/cpf.vo";
import {DoctorStatusVo} from "@shared/valueObjects/doctorStatus.vo";
import {PatientStatusVo} from "@shared/valueObjects/patientStatus.vo";
import {QueueEntryTypeVo} from "@shared/valueObjects/queueEntryType.vo";
import {RoomTypeVo} from "@shared/valueObjects/roomType.vo";
import {PriorityVo} from "@shared/valueObjects/triagePriority.vo";

export const VALID_CPF = "52998224725";
export const OTHER_CPF = "39053344705";

export function patient(id: number, name = "MARIA SILVA", cpf = VALID_CPF): Patients {
    return Patients.rehydrate({
        id,
        name,
        birthday: DateUtil.parse("1990-01-01"),
        cpf: CpfVo.createCpf(cpf),
    });
}

export function attendance(
    id: number,
    patientId: number,
    status: PatientStatusVo = PatientStatusVo.QUEUE,
    priority?: PriorityVo,
    arrivalAt: Date = DateUtil.parse("2026-08-03T10:00:00-03:00"),
): PatientAttendances {
    return PatientAttendances.rehydrate({
        id,
        patientId,
        symptoms: "Febre e dor",
        arrivalAt,
        priority,
        status,
        triageStartedAt: status.isTriage() ? DateUtil.parse("2026-08-03T10:05:00-03:00") : undefined,
        treatmentStartedAt: status.isTreatment() ? DateUtil.parse("2026-08-03T10:10:00-03:00") : undefined,
    });
}

export function room(id: number, type: RoomTypeVo, isEmpty = true): Rooms {
    return Rooms.rehydrate({
        id,
        name: `S${id}`,
        isActive: true,
        isEmpty,
        type,
    });
}

export function doctor(id: number, roomId: number): Doctor {
    return Doctor.rehydrate({
        id,
        name: `MEDICO ${id}`,
        cpf: CpfVo.createCpf(id === 1 ? VALID_CPF : OTHER_CPF),
        roomId,
        status: DoctorStatusVo.WORKING,
    });
}

export function activeEntry(
    attendanceId: number,
    patientId: number,
    doctorId: number,
    type: QueueEntryTypeVo,
): ActiveQueueEntry {
    return new ActiveQueueEntry({
        attendanceId,
        patientId,
        callNumber: attendanceId,
        doctorId,
        queueType: type,
        startedAt: DateUtil.parse("2026-08-03T10:20:00-03:00"),
    });
}
