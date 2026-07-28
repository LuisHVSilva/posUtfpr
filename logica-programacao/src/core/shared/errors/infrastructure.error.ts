import {ApplicationError} from "./application.error";

export class InfrastructureError extends ApplicationError {
    code: string = "INFRA_ERROR";
    statusCode = 500;

    constructor(message: string, public readonly cause?: unknown) {
        super(message);
    }
}

export class RepositoryError extends InfrastructureError {
    readonly code: string = "REPO_ERROR";
}
