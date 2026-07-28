import {inject, injectable} from "tsyringe";
import {BusinessRuleError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientsPersistence} from "@features/persistences/patients.persistence";
import {Patients} from "@features/entities/patients";

@injectable()
export class PatientsService {
    constructor(
        @inject("PatientsPersistence")
        private patientsRepository: PatientsPersistence
    ) {
    }

    async registerPatients(name: string, birthday: string, cpf: string): Promise<Patients> {
        const birthdayDate: Date = DateUtil.parse(birthday);
        const patient: Patients = Patients.create(name, birthdayDate, cpf);

        const exists: boolean = await this.patientsRepository.existsByCpf(patient.cpf.toString());

        if (exists) {
            throw new BusinessRuleError(`Patient already exists for cpf: ${patient.cpf.toString()}`);
        }

        return await this.patientsRepository.save(patient);
    }
}
