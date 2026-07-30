import {StatusCodes} from "http-status-codes";
import {RequestContext} from "@infra/logger/context/request.context";

export class LogFormatter {
    private getCurrentTimestamp(): string { return new Date().toISOString(); }

    /**
     * Formats a log message with the given parameters.
     *
     * @param level - Log level (e.g., ERROR, WARN, INFO).
     * @param className - Name of the class where the log is generated.
     * @param method - Name of the method where the log is generated.
     * @param message - The log message.
     * @param httpStatus - Optional HTTP status code.
     * @param info - Optional additional information to include in the log.
     * @returns A formatted log string.
     */
    public format(level: string, className: string, method: string, message: string, httpStatus?: StatusCodes, info?: unknown): string {
        const request = RequestContext.get();
        const entry = {
            timestamp: this.getCurrentTimestamp(),
            level,
            source: `${className}.${method}`,
            message,
            ...(httpStatus ? {httpStatus} : {}),
            ...(request ? {requestId: request.requestId, request: {method: request.method, path: request.path, participantId: request.participantId}} : {}),
            ...(info !== undefined ? {details: info} : {}),
        };

        return `${JSON.stringify(entry)}\n`;
    }
}
