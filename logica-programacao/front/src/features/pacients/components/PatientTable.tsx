import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import type {PatientRecord, PatientStatus} from "../types/pacients.types";
import "../styles/pacients.scss";

const statusLabels: Record<PatientStatus, string> = {
    emergency: "Emergencia",
    urgent: "Urgencia",
    stable: "Estavel"
};

type PatientTableProps = {
    patients: PatientRecord[];
    onEdit: (patient: PatientRecord) => void;
};

export function PatientTable({patients, onEdit}: PatientTableProps) {
    return (
        <section className="patient-table" aria-labelledby="patient-table-title">
            <header className="patient-table__header">
                <h2 id="patient-table-title">Lista de Pacientes</h2>
                <div className="patient-table__tools">
                    <button type="button" aria-label="Filtrar pacientes"><Icon name="filter"/></button>
                    <button type="button" aria-label="Baixar lista"><Icon name="download"/></button>
                </div>
            </header>

            <div className="patient-table__scroll">
                <table>
                    <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>CPF</th>
                        <th>Data Nasc.</th>
                        <th>Status</th>
                        <th>Acoes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {patients.map((patient) => (
                        <tr className={`patient-table__row patient-table__row--${patient.status}`} key={patient.id}>
                            <td>
                                <div className="patient-table__identity">
                                    <span className="patient-table__avatar">{patient.initials}</span>
                                    <div>
                                        <strong>{patient.name}</strong>
                                        <span>ID: {patient.id}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="patient-table__mono">{patient.cpf}</td>
                            <td>{patient.birthDate}</td>
                            <td>
                                <span className={`patient-table__status patient-table__status--${patient.status}`}>
                                    {statusLabels[patient.status]}
                                </span>
                            </td>
                            <td>
                                <div className="patient-table__actions">
                                    <button type="button" onClick={() => onEdit(patient)}
                                            aria-label={`Editar ${patient.name}`}>
                                        <Icon name="edit"/>
                                    </button>
                                    <button type="button" onClick={() => onEdit(patient)}
                                            aria-label={`Ver detalhes de ${patient.name}`}>
                                        <Icon name="view"/>
                                    </button>
                                    <button type="button" aria-label={`Excluir ${patient.name}`}>
                                        <Icon name="delete"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <footer className="patient-table__footer">
                <p>Exibindo 3 de 1.284 pacientes</p>
                <div>
                    <Button variant="ghost">Anterior</Button>
                    <Button variant="ghost">Proximo</Button>
                </div>
            </footer>
        </section>
    );
}
