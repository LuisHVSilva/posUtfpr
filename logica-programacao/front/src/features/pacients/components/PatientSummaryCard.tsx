import {Card} from "../../../shared/components/Card/Card";
import {Icon} from "../../../shared/components/Icon/Icon";
import type {PatientSummary} from "../types/pacients.types";
import "../styles/pacients.scss";

export function PatientSummaryCard({label, value, icon, tone}: PatientSummary) {
    return (
        <Card className={`patient-summary-card patient-summary-card--${tone}`}>
            <span className="patient-summary-card__icon"><Icon name={icon}/></span>
            <div>
                <span className="patient-summary-card__label">{label}</span>
                <strong>{value}</strong>
            </div>
        </Card>
    );
}
