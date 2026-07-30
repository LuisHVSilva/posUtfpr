import type {ButtonHTMLAttributes, ReactNode} from "react";
import "./Button.scss";

export type ButtonVariant = "primary" | "neutral" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
    icon?: ReactNode;
    fullWidth?: boolean;
};

export function Button({
                           children,
                           variant = "primary",
                           icon,
                           fullWidth = false,
                           className = "",
                           ...props
                       }: ButtonProps) {
    const classes = ["button", `button--${variant}`, fullWidth ? "button--full" : "", className].filter(Boolean).join(" ");

    return <button className={classes} {...props}>{icon}<span>{children}</span></button>;
}
