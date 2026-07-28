import {inject, injectable} from "tsyringe";
import {BusinessRuleError, NotFoundError, ValidationError} from "@shared/errors/application.error";
import {DateUtil} from "@shared/utils/date.util";
import {PatientsPersistence} from "@features/persistences/patients.persistence";
import {Patients} from "@features/entities/patients";
import {CpfVo} from "@shared/valueObjects/cpf.vo";

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

    async updateRegistration(id: number, name?: string, cpf?: string, birthday?: string): Promise<Patients> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationError("Patient id must be a positive integer");
        }

        const patient: Patients | null = await this.patientsRepository.findByPk(id);

        if (!patient) {
            throw new NotFoundError(`Patient ${id} not found`);
        }

        let updatedPatient = patient;

        if (cpf !== undefined) {
            const cpfVo: CpfVo = CpfVo.createCpf(cpf);
            const findByCpf: Patients | null = await this.patientsRepository.findByCpf(cpfVo.toString())

            if (findByCpf && findByCpf.id !== id) {
                throw new BusinessRuleError(`Cpf ${findByCpf.id} already exists.`);
            }

            updatedPatient = updatedPatient.updateCpf(cpfVo);
        }

        if (name !== undefined) {
            updatedPatient = updatedPatient.updateName(name);
        }

        if (birthday !== undefined) {
            updatedPatient = updatedPatient.updateBirthday(DateUtil.parse(birthday));
        }

        return await this.patientsRepository.update(updatedPatient);
    }
}
