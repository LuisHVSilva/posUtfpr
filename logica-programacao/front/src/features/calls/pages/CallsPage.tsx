import {useState} from "react";
import {AdminLayout} from "../../../layouts/AdminLayout/AdminLayout";
import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import {useCallsData} from "../hooks/useCallsData";
import {EditPatientModal} from "../components/EditPatientModal";
import {PatientRegistryModal} from "../components/PatientRegistryModal";
import {PatientSummaryCard} from "../components/PatientSummaryCard";
import {PatientTable} from "../components/PatientTable";
import type {PatientRecord} from "../types/calls.types";
import "../styles/calls.scss";

export function CallsPage() {
    const [registryOpen, setRegistryOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const {data} = useCallsData();

    if (!data) {
        return <AdminLayout activePath="/senhas"><h1>Erro de dado</h1></AdminLayout>;
    }

    const openEditModal = (patient?: PatientRecord) => {
        setSelectedPatient(patient ?? data.patients[0]);
        setRegistryOpen(false);
    };

    return (
        <AdminLayout activePath="/senhas">
            <div className="calls-page">
                <header className="calls-page__header">
                    <div>
                        <h1>Gestao de Pacientes</h1>
                        <p>Visualize, edite e gerencie o registro completo de pacientes da unidade.</p>
                    </div>
                    <Button icon={<Icon name="add"/>} onClick={() => setRegistryOpen(true)}>Novo Registro</Button>
                </header>

                <section className="patient-summary-grid" aria-label="Resumo de pacientes">
                    {data.summary.map((item) => <PatientSummaryCard key={item.label} {...item}/>)}
                </section>

                <PatientTable patients={data.patients} onEdit={openEditModal}/>
            </div>

            <PatientRegistryModal
                open={registryOpen}
                records={data.registry}
                onClose={() => setRegistryOpen(false)}
                onSelect={openEditModal}
            />
            <EditPatientModal
                open={selectedPatient !== null}
                patient={selectedPatient}
                onClose={() => setSelectedPatient(null)}
            />
        </AdminLayout>
    );
}
