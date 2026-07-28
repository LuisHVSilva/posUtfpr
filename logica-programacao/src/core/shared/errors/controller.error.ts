import {StatusCodes} from "http-status-codes";
import {controllerMessages} from "../constants/messages";

interface HttpResponse {
    status(statusCode: number): HttpResponse;

    json(body: unknown): HttpResponse;
}

export class ControllerError extends Error {
    static handleError<T extends HttpResponse>(
        res: T,
        statusCode: StatusCodes = StatusCodes.BAD_REQUEST,
    ): T {
        return res.status(statusCode).json({
            success: false,
            message: controllerMessages.error.unknownError,
        }) as T;
    }
}

export abstract class ControllerErrorResponse extends Error {
    abstract code: string;
    abstract statusCode: number;

    protected constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UserNotInRequest extends ControllerErrorResponse {
    code: string = "USER_NOT_IN_REQUEST";
    statusCode: number = StatusCodes.UNAUTHORIZED;

    constructor() {
        super(controllerMessages.error.invalidAuthentication);
    }
}
