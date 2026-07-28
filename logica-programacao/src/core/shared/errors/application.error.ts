import {StatusCodes} from "http-status-codes";

export abstract class ApplicationError extends Error {
    abstract code: string;
    abstract statusCode: number;

    protected constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class DomainError extends ApplicationError {
    code: string = "DOMAIN_ERROR";
    statusCode: number = StatusCodes.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}

export class ValidationError extends DomainError {
    readonly code: string = "VALIDATION_ERROR";
}

export class BusinessRuleError extends DomainError {
    readonly code: string = "BUSINESS_RULE_VIOLATION";
}

export class FileError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode = 400,
        public readonly code?: string,
    ) {
        super(message);
    }
}