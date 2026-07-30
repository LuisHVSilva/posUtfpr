import {StatusCodes} from "http-status-codes";
import {LoggerContext} from "@infra/logger/context/logger.context";

export interface ILogger {
    /**
     * Logs an error message.
     *
     * @param context - Name of the class associated with the log.
     * @param message - Descriptive error message.
     * @param stack - Stack trace of the error, if available.
     * @param httpStatus - HTTP status code, if applicable.
     * @param info - Additional context information.
     */
    logError(context: LoggerContext, message: string, stack?: string, info?: any, httpStatus?: StatusCodes): Promise<void>;

    /**
     * Logs a warning message, useful for unexpected but non-critical events.
     *
     * @param context - Name of the class associated with the log.
     * @param message - Descriptive warning message.
     * @param httpStatus - HTTP status code, if applicable.
     * @param info - Additional context information.
     */
    logWarn(context: LoggerContext, message: string, httpStatus?: StatusCodes, info?: any): Promise<void>;

    /**
     * Logs an informational message, including success logger.
     *
     * @param context - Name of the class associated with the log.
     * @param message - Informational or success message.
     * @param httpStatus - HTTP status code, if applicable.
     * @param info - Additional context information.
     */
    logInfo(context: LoggerContext, message: string, httpStatus?: StatusCodes, info?: any): Promise<void>;

    /**
     * Logs an exception, typically used for unhandled errors.
     *
     * @param context - Name of the class associated with the log.
     * @param error - The error object to log.
     * @param info - Additional context information.
     * @param httpStatus - HTTP status code, if applicable.
     */
    logException(context: LoggerContext, error: Error, info?: any, httpStatus?: StatusCodes): Promise<void>;
}