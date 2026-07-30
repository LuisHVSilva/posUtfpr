import {useState} from "react";
import {AdminLayout} from "../../../layouts/AdminLayout/AdminLayout";
import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import {EditPatientModal} from "../components/EditPatientModal";
import {PatientRegistryModal} from "../components/PatientRegistryModal";
import {PatientSummaryCard} from "../components/PatientSummaryCard";
import {PatientTable} from "../components/PatientTable";
import {usePacientsData} from "../hooks/usePacientsData";
import type {PatientRecord} from "../types/pacients.types";
import {queryClient} from "../../../shared/services/queryClient.service";
import "../styles/pacients.scss";

export function PacientsPage() {
    const [registryOpen, setRegistryOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const {data} = usePacientsData();

    if (!data) {
        return <AdminLayout activePath="/pacientes"><h1>Erro de dado</h1></AdminLayout>;
    }

    const openEditModal = (patient?: PatientRecord) => {
        setSelectedPatient(patient ?? data.patients[0]);
        setRegistryOpen(false);
    };

    const handlePatientSaved = async () => {
        await queryClient.invalidateQueries({queryKey: ["pacientsPageData"]});
    };

    return (
        <AdminLayout activePath="/pacientes">
            <div className="pacients-page">
                <header className="pacients-page__header">
                    <div>
                        <h1>Gestao de Pacientes</h1>
                        <p>Visualize, edite e gerencie o registro completo de pacientes da unidade.</p>
                    </div>
                    <Button icon={<Icon name="add"/>} onClick={() => setRegistryOpen(true)}>Novo Registro</Button>
                </header>

                <section className="patient-summary-grid" aria-label="Resumo de pacientes">
                    {data.summary.map((item) => <PatientSummaryCard key={item.label} {...item}/>)}
                </section>

                <PatientTable patients={data.patients} pagination={data.pagination} onEdit={openEditModal}/>
            </div>

            <PatientRegistryModal
                open={registryOpen}
                onClose={() => setRegistryOpen(false)}
                onSaved={handlePatientSaved}
            />
            <EditPatientModal
                open={selectedPatient !== null}
                patient={selectedPatient}
                onClose={() => setSelectedPatient(null)}
                onSaved={handlePatientSaved}
            />
        </AdminLayout>
    );
}
