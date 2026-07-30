import {Card} from "../../../shared/components/Card/Card";
import "../styles/dashboard.scss";

type SummaryCardProps = {
    label: string;
    value: string | number;
    tone?: "primary" | "secondary" | "neutral" | "danger"
};

export function SummaryCard({label, value, tone = "primary"}: SummaryCardProps) {
    return (
        <Card className={`summary-card summary-card--${tone}`}>
            <span
                className="summary-card__label">{label}</span>
            <strong>{value}</strong>
        </Card>
    );
}
