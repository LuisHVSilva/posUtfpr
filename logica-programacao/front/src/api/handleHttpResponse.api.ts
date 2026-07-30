import axios, {HttpStatusCode} from "axios";
import type {HttpResponseErrorType} from "../shared/types/httpResponse.type.ts";
import {AppError, ConflictError, ValidationError} from "../shared/errors/errors.ts";

export const DEFAULT_ERROR_MESSAGE = "Erro. Por favor, tente novamente.";

class HandleHttpResponseApi {
    private handleBadRequest(data: HttpResponseErrorType): ValidationError {
        if (data.errors?.length) {
            return new ValidationError(data.errors.join("\n"));
        }
        return new ValidationError(data.message ?? DEFAULT_ERROR_MESSAGE);
    }

    private handleUnauthorized(data: HttpResponseErrorType): AppError {
        return new AppError(data.message ?? DEFAULT_ERROR_MESSAGE);
    }

    private handleForbidden(data: HttpResponseErrorType) {
        return new AppError(data.message ?? DEFAULT_ERROR_MESSAGE);
    }

    private handleConflict(data: HttpResponseErrorType) {
        const message: string = data.message ?? DEFAULT_ERROR_MESSAGE;
        return new ConflictError(message);
    }

    private handleInternalServerError(data: HttpResponseErrorType) {
        const message: string = data.message ?? DEFAULT_ERROR_MESSAGE;
        return new AppError(message, HttpStatusCode.InternalServerError)
    }

    mapHttpError(status: number, data: HttpResponseErrorType): Error {
        switch (status) {
            case HttpStatusCode.BadRequest:
                return this.handleBadRequest(data);
            case HttpStatusCode.Unauthorized:
                return this.handleUnauthorized(data);
            case HttpStatusCode.Forbidden:
                return this.handleForbidden(data);
            case HttpStatusCode.Conflict:
                return this.handleConflict(data);
            case HttpStatusCode.InternalServerError:
                return this.handleInternalServerError(data);
            default:
                return new AppError(data.message ?? DEFAULT_ERROR_MESSAGE, status);
        }
    }

    mapAxiosError(error: unknown): Error {
        if (!axios.isAxiosError(error) || !error.response) {
            return new AppError(DEFAULT_ERROR_MESSAGE);
        }

        const data = error.response.data;
        const responseData: HttpResponseErrorType = data && typeof data === "object"
            ? data as HttpResponseErrorType
            : {};

        return this.mapHttpError(error.response.status, responseData);
    }
}

export const handleHttpResponseApi = new HandleHttpResponseApi();
