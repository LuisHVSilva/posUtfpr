export class Errors extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ServiceError";
    }
}

export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ServiceError";
    }
}

export class ConflictError extends Errors {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}

export class ValidationError extends Errors {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class AppError extends Error {
    status?: number;
    details?: unknown;

    constructor(message: string, status?: number, details?: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
