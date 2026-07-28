import fs from "fs";
import * as path from "path";
import {StatusCodes} from "http-status-codes";
import {infrastructureMessages} from "@shared/constants/messages";
import {ILogger} from "@infra/logger/logger.interface";
import {LogFormatter} from "@infra/logger/formatter/logger.formater";
import {ERROR_DESCRIPTION, INFO_DESCRIPTION, LOGS_PATH, WARN_DESCRIPTION} from "@infra/logger/logger.constants";
import {LoggerContext} from "@infra/logger/context/logger.context";


interface LoggerConfig {
    logFolder?: string;
    filePrefix?: string;
}

class Logger implements ILogger {
    private readonly _logFormatter: LogFormatter = new LogFormatter();

    private readonly logFolder: string;
    private readonly logFilePath: string;

    constructor(private readonly config: LoggerConfig = {}) {
        this.logFolder = config.logFolder ?? LOGS_PATH;
        this.logFilePath = this.getLogFilePath();
        this.onStart();
    }

    private getLogFilePath(): string {
        const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const prefix = this.config.filePrefix ? `${this.config.filePrefix}-` : "";

        return path.join(this.logFolder, `${prefix}${date}.log`);
    }

    private onStart(): void {
        this.ensureLogDirectoryExists()
            .then(() =>
                console.log()
            );
    }

    private async saveLog(logMessage: string): Promise<void> {
        try {
            // A primeira mensagem pode ser registrada antes da inicialização assíncrona
            // disparada no construtor. Garantir a pasta aqui evita uma condição de corrida.
            await this.ensureLogDirectoryExists();
            await fs.promises.appendFile(this.logFilePath, logMessage);
            process.stdout.write(logMessage);
        } catch (err) {
            console.error(
                infrastructureMessages.error.logWriteFailed,
                err
            );
        }
    }

    private async ensureLogDirectoryExists(): Promise<void> {
        try {
            await fs.promises.mkdir(
                path.dirname(this.logFilePath),
                {recursive: true}
            );
        } catch (err) {
            console.error(
                infrastructureMessages.error.logDirectoryCreationFailed,
                err
            );
        }
    }

    async logError(
        context: LoggerContext,
        message: string,
        stack?: string,
        info?: any,
        httpStatus?: StatusCodes
    ): Promise<void> {
        const logMessage = this._logFormatter.format(
            ERROR_DESCRIPTION,
            context.className,
            context.method,
            message,
            httpStatus,
            {...(info ?? {}), ...(stack ? {stack} : {})}
        );

        await this.saveLog(logMessage);
    }

    async logException(
        context: LoggerContext,
        error: Error,
        info?: any,
        httpStatus?: StatusCodes
    ): Promise<void> {
        await this.logError(
            context,
            error.message,
            error.stack,
            info,
            httpStatus
        );
    }

    async logWarn(
        context: LoggerContext,
        message: string,
        httpStatus?: StatusCodes,
        info?: any
    ): Promise<void> {
        const logMessage = this._logFormatter.format(
            WARN_DESCRIPTION,
            context.className,
            context.method,
            message,
            httpStatus,
            info
        );

        await this.saveLog(logMessage);
    }

    async logInfo(
        context: LoggerContext,
        message: string,
        httpStatus?: StatusCodes,
        info?: any
    ): Promise<void> {
        const logMessage = this._logFormatter.format(
            INFO_DESCRIPTION,
            context.className,
            context.method,
            message,
            httpStatus,
            info
        );

        await this.saveLog(logMessage);
    }
}

export {Logger};
