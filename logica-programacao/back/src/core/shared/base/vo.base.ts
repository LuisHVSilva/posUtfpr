import {VOMessages} from "@shared/constants/messages";


export abstract class VoBase<T> {
    protected constructor(protected readonly value: T) {}

    getValue(): T {
        return this.value;
    }

    abstract toString(): string;

    protected static assertIn<T>(value: unknown, allowed: readonly T[], name: string = VOMessages.info.valueObjectType): asserts value is T {
        if (!allowed.includes(value as T)) {
            throw new Error(VOMessages.error.domainValueInvalid(value, name));
        }
    }
}
