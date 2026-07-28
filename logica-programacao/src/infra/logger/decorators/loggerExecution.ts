import {container} from "tsyringe";
import {ILogger} from "@infra/logger/logger.interface";
import {LoggerContext} from "@infra/logger/context/logger.context";
import {infrastructureMessages} from "@shared/constants/messages";

interface LoggerExecutionOptions {
    loggerToken?: string;
}

export function LoggerExecution(options?: LoggerExecutionOptions): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const logger = container.resolve<ILogger>(
                options?.loggerToken ?? "ILogger"
            );

            const context = new LoggerContext(
                target.constructor.name,
                propertyKey.toString()
            );

            const start = Date.now();

            try {
                await logger.logInfo(
                    context,
                    infrastructureMessages.error.executionStarted
                );

                const result = await originalMethod.apply(this, args);

                const duration = Date.now() - start;

                await logger.logInfo(
                    context,
                    infrastructureMessages.error.executionCompleted(
                        duration
                    )
                );

                return result;

            } catch (error: any) {
                const duration = Date.now() - start;

                await logger.logError(
                    context,
                    infrastructureMessages.error.unexpectedErrorWithMessage(
                        String(error.message ?? error)
                    ),
                    error.stack,
                    {duration}
                );

                throw error;
            }
        };
    };
}