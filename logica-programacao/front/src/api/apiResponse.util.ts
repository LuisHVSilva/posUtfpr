import {HttpStatusCode} from "axios";
import {ServiceError} from "../shared/errors/errors.ts";

const DEFAULT_ERROR_MESSAGE = "Erro. Por favor, tente novamente.";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    result: T;
};

export function assertApiSuccess<T>(data: ApiResponse<T>, statusCodeResponse?: number): asserts data is ApiResponse<T> & {
    success: true
} {
    if (statusCodeResponse && statusCodeResponse === HttpStatusCode.NoContent) {
        return;
    }

    if (!data.success) {
        throw new ServiceError(data.message || DEFAULT_ERROR_MESSAGE);
    }
}
