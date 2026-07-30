import {NextFunction, Request, Response} from "express";
import {ApplicationError, FileError} from "@shared/errors/application.error";
import {ControllerErrorResponse} from "@shared/errors/controller.error";
import {commonMessages} from "@shared/constants/messages";
import {container} from "tsyringe";
import {ILogger} from "@infra/logger/logger.interface";
import {LoggerContext} from "@infra/logger/context/logger.context";

export class ErrorHandlerMiddleware {
    public static async handleError(err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> {
        const statusCode = err instanceof FileError || err instanceof ApplicationError || err instanceof ControllerErrorResponse
            ? err.statusCode
            : 500;
        const error = err instanceof Error ? err : new Error(String(err));
        const logger = container.resolve<ILogger>("ILogger");

        await logger.logException(
            new LoggerContext("ErrorHandlerMiddleware", "handleError"),
            error,
            {errorName: error.name, method: req.method, path: req.originalUrl, requestId: res.locals.requestId},
            statusCode,
        );

        if (err instanceof FileError) {
            res.status(err.statusCode).json({message: err.message, code: err.code, requestId: res.locals.requestId});
            return;
        }

        if (err instanceof ApplicationError || err instanceof ControllerErrorResponse) {
            res.status(err.statusCode).json({message: err.message, requestId: res.locals.requestId});
            return;
        }

        res.status(500).json({message: commonMessages.error.unexpectedRequest, requestId: res.locals.requestId});
    }
}
