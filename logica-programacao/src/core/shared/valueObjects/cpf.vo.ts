import {BusinessRuleError} from "@shared/errors/application.error";
import {VoBase} from "@shared/base/vo.base";
import {VOMessages} from "@shared/constants/messages";

export class CpfVo extends VoBase<string> {
    private constructor(value: string) {
        super(value);
        this.cpfValidation();
    }

    //#region CPF VALIDATOR
    private cpfLengthValidation(): void {
        if (this.value.length !== 11) {
            throw new BusinessRuleError(VOMessages.error.cpfInvalidLength);
        }
    }

    private cpfIdenticalDigitsValidation(): void {
        if (/^(\d)\1+$/.test(this.value)) {
            throw new BusinessRuleError(VOMessages.error.cpfIdenticalDigits);
        }
    }

    private cpfDigitsValidation(): void {
        const digits = this.value.split('').map(Number);

        // First digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += digits[i] * (10 - i);
        }
        let firstCheck = (sum * 10) % 11;
        if (firstCheck === 10) firstCheck = 0;

        if (firstCheck !== digits[9]) {
            throw new BusinessRuleError(VOMessages.error.cpfInvalidValue);
        }

        // Second digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += digits[i] * (11 - i);
        }
        let secondCheck = (sum * 10) % 11;
        if (secondCheck === 10) secondCheck = 0;

        if (secondCheck !== digits[10]) {
            throw new BusinessRuleError(VOMessages.error.cpfInvalidValue);
        }
    }

    private cpfValidation(): void {
        this.cpfLengthValidation();
        this.cpfIdenticalDigitsValidation();
        this.cpfDigitsValidation();
    }

    //#endregion

    static createCpf(cpf: string): CpfVo {
        const cleaned = cpf.replace(/\D/g, '').padStart(11, '0');

        return new CpfVo(cleaned);
    }

    getValue(): string {
        return super.getValue();
    }

    toString(): string {
        return this.getValue();
    }
}
