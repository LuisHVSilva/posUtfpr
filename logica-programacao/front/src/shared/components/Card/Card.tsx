import type {ReactNode} from "react";
import "./Card.scss";

type CardProps = { children: ReactNode; className?: string };

export function Card({children, className = ""}: CardProps) {
    return <article className={`surface-card card ${className}`}>{children}</article>;
}
