import path from "path";

// Logs ficam ao lado do diretório backend, tanto na execução local quanto no container.
export const ROOT_PATH = path.resolve(process.cwd(), ".");

export const LOGS_PATH = path.resolve(ROOT_PATH, "LOGS");
export const APP_PATH = path.resolve(LOGS_PATH, "APP");

export const ERROR_DESCRIPTION = "ERROR";
export const WARN_DESCRIPTION = "WARNING";
export const INFO_DESCRIPTION = "INFO";

