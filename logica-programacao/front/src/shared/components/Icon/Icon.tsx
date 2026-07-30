import type {CSSProperties} from "react";

export type IconName =
    "hospital"
    | "dashboard"
    | "ticket"
    | "patients"
    | "help"
    | "logout"
    | "bell"
    | "settings"
    | "add"
    | "check"
    | "emergency"
    | "lock"
    | "close"
    | "groups"
    | "clinicalNotes"
    | "triage"
    | "filter"
    | "download"
    | "edit"
    | "view"
    | "delete"
    | "account"
    | "search"
    | "warning"
    | "stethoscope"
    | "medicalBox"
    | "door";

const icons: Record<IconName, string> = {
    hospital: "+",
    dashboard: "[]",
    ticket: "@",
    patients: "P",
    help: "?",
    logout: "->",
    bell: "!",
    settings: "*",
    add: "+",
    check: "v",
    emergency: "!",
    lock: "#",
    close: "x",
    groups: "G",
    clinicalNotes: "N",
    triage: "T",
    filter: "=",
    download: "v",
    edit: "/",
    view: "o",
    delete: "x",
    account: "O",
    search: "Q",
    warning: "!",
    stethoscope: "S",
    medicalBox: "+"
    ,
    door: "D"
};

export function Icon({name, size = "1em"}: { name: IconName; size?: string }) {
    const style: CSSProperties = {fontSize: size, lineHeight: 1};
    return <span aria-hidden="true" style={style}>{icons[name]}</span>;
}
