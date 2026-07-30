export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ServiceError";
    }
}

export class ConflictError extends ServiceError {
    constructor(message: string) {
        super(message);
        this.name = "ConflictError";
    }
}

export class NotFoundError extends ServiceError {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

export class ValidationError extends ServiceError {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class NullFieldError extends ServiceError {
    constructor(message: string) {
        super(message);
        this.name = "NullFieldError";
    }
}

