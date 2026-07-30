import {inject, injectable} from "tsyringe";
import {type ILogger} from "@infra/logger/logger.interface";
import {IJobLogger} from "@infra/logger/jobLogger/jobLogger.interface";
import {LoggerContext} from "@infra/logger/context/logger.context";

@injectable()
export class JobLogger implements IJobLogger {
    constructor(
        @inject("IJobBaseLogger")
        private readonly logger: ILogger
    ) {
    }

    async info(_target: object, _message: string, _info?: unknown): Promise<void> {
        // Execuções bem-sucedidas de jobs são frequentes e não precisam ocupar
        // o log da aplicação. Falhas continuam sendo registradas em error().
    }

    async error(target: object, error: Error, info?: unknown): Promise<void> {
        await this.logger.logException(
            this.getContext(target),
            error,
            info
        );
    }

    private getContext(target: object): LoggerContext {
        return {
            className: target.constructor.name,
            method: "execute",
        };
    }
}
