import {Button} from "../../../shared/components/Button/Button";
import {Icon} from "../../../shared/components/Icon/Icon";
import type {PatientListRecord, PatientRecord} from "../types/pacients.types";
import "../styles/pacients.scss";

type PatientRegistryModalProps = {
    open: boolean;
    records: PatientListRecord[];
    onClose: () => void;
    onSelect: (patient?: PatientRecord) => void;
};

export function PatientRegistryModal({open, records, onClose, onSelect}: PatientRegistryModalProps) {
    if (!open) return null;

    return (
        <div className="pacients-modal pacients-modal--wide" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="pacients-modal__content" role="dialog" aria-modal="true"
                     aria-labelledby="registry-title">
                <header className="pacients-modal__hero">
                    <div>
                        <h2 id="registry-title">Registros do Sistema</h2>
                        <p>Gestao unificada de base de dados</p>
                    </div>
                    <button type="button" aria-label="Fechar registros" onClick={onClose}><Icon name="close"/></button>
                </header>

                <nav className="pacients-modal__tabs" aria-label="Categorias de registros">
                    <button type="button" className="is-active">Pacientes Ativos</button>
                    <button type="button">Historico/Arquivados</button>
                    <button type="button">Transferencias</button>
                </nav>

                <div className="registry-list">
                    {records.map((record) => (
                        <article className="registry-list__item" key={record.cpf}>
                            <div>
                                <Icon name="account"/>
                                <div>
                                    <strong>{record.name}</strong>
                                    <span>CPF: {record.cpf}</span>
                                </div>
                            </div>
                            <Button onClick={() => onSelect()}>Selecionar</Button>
                        </article>
                    ))}
                </div>

                <footer className="pacients-modal__footer">
                    <Button variant="ghost" onClick={onClose}>Fechar</Button>
                </footer>
            </section>
        </div>
    );
}
