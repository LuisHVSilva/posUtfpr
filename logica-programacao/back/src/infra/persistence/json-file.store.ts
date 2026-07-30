import {existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from "node:fs";
import {dirname} from "node:path";
import {RepositoryError} from "@shared/errors/infrastructure.error";
import {injectable} from "tsyringe";

@injectable()
export class JsonFileStore<T extends { id: number }> {
    constructor(
        private readonly filePath: string
    ) {
    }

    readAll(): T[] {
        this.ensureFileExists();

        try {
            const content = readFileSync(this.filePath, "utf-8");
            const records: unknown = JSON.parse(content);

            if (!Array.isArray(records)) {
                throw new RepositoryError(`JSON collection must be an array: ${this.filePath}`);
            }

            return records as T[];
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }

            throw new RepositoryError(`Could not read JSON collection: ${this.filePath}`, error);
        }
    }

    replaceAll(records: T[]): void {
        this.ensureDirectoryExists();
        const temporaryFilePath = `${this.filePath}.tmp`;

        try {
            writeFileSync(temporaryFilePath, `${JSON.stringify(records, null, 2)}\n`, "utf-8");
            renameSync(temporaryFilePath, this.filePath);
        } catch (error) {
            throw new RepositoryError(`Could not write JSON collection: ${this.filePath}`, error);
        }
    }

    nextId(records: T[]): number {
        return records.reduce((highestId, record) => Math.max(highestId, record.id), 0) + 1;
    }

    private ensureFileExists(): void {
        if (!existsSync(this.filePath)) {
            this.replaceAll([]);
        }
    }

    private ensureDirectoryExists(): void {
        mkdirSync(dirname(this.filePath), {recursive: true});
    }
}
