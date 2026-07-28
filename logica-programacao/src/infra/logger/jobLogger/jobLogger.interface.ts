export interface IJobLogger {
    info(target: object, message: string, info?: unknown): Promise<void>;
    error(target: object, error: Error, info?: unknown): Promise<void>;
}