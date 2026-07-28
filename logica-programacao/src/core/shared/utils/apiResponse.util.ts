import {Response} from "express";
import {StatusCodes} from "http-status-codes";
import {ControllerError} from "@shared/errors/controller.error";
import {ApplicationError} from "@shared/errors/application.error";
import {commonMessages} from "@shared/constants/messages";

export class ApiResponseUtil {
    static success<T>(res: Response, result?: T, status: number = StatusCodes.OK): Response {
        if (!result) return res.status(StatusCodes.NO_CONTENT).json({success: true});

        return res.status(status).json({success: true, result});
    }

    static error(res: Response, message: string, status: number = StatusCodes.BAD_REQUEST): Response {
        return res.status(status).json({success: false, message});
    }

    static notFound(res: Response, message: string = commonMessages.error.notFound): Response {
        return this.error(res, message, StatusCodes.NOT_FOUND);
    }

    static redirect(res: Response, url: string): void {
        return res.redirect(url);
    }


    static handleResultError(res: Response, error: unknown): Response {
        if (error instanceof ApplicationError) {
            return this.error(
                res,
                error.message,
                error.statusCode
            );
        }

        return ControllerError.handleError(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}
